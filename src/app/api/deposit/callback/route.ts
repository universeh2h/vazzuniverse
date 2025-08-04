import { DUITKU_MERCHANT_CODE } from "@/constants";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Types untuk better type safety
interface CallbackData {
  merchantCode: string;
  amount: string;
  merchantOrderId: string;
  resultCode: string;
  signature: string;
}



export async function POST(req: NextRequest) {
  try {
    // Parse callback data
    const callbackData = await parseCallbackData(req);
    
    // Validate required fields
    const validationResult = validateCallbackData(callbackData);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, message: validationResult.message },
        { status: 400 }
      );
    }

    const { merchantCode, amount, merchantOrderId, resultCode, signature } = callbackData;

    // Validate merchant code
    if (merchantCode !== DUITKU_MERCHANT_CODE) {
      return NextResponse.json(
        { success: false, message: "Invalid merchant code" },
        { status: 400 }
      );
    }

  
    return await prisma.$transaction(async (tx) => {
      const depositMatch = merchantOrderId.match(/^DEP-(\d+)/);
      const membershipMatch = merchantOrderId.match(/^MEM-(\d+)/); 
      
      if (depositMatch) {
        return await processDepositCallback(tx, callbackData);
      } else if (membershipMatch) {
        return await processMembershipCallback(tx, callbackData);
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid order ID format" },
          { status: 400 }
        );
      }
    });

  } catch (error) {
    console.error("Callback processing error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to parse callback data
async function parseCallbackData(req: NextRequest): Promise<CallbackData> {
  const contentType = req.headers.get("content-type") || "";
  
  if (contentType.includes("application/json")) {
    return await req.json();
  } else {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as any;
    
    if (data.amount) {
      data.amount = data.amount.toString();
    }
    
    return data;
  }
}

function validateCallbackData(data: any): { isValid: boolean; message?: string } {
  const required = ['merchantCode', 'merchantOrderId', 'amount', 'signature', 'resultCode'];
  
  for (const field of required) {
    if (!data[field]) {
      return { isValid: false, message: `Missing required field: ${field}` };
    }
  }
  
  return { isValid: true };
}

async function processDepositCallback(tx: any, callbackData: CallbackData) {
  const { merchantOrderId, resultCode } = callbackData;
  
  // Find deposit record
  const deposit = await tx.deposits.findFirst({
    where: { depositId: merchantOrderId },
  });

  if (!deposit) {
    return NextResponse.json(
      { success: false, message: "Deposit not found" },
      { status: 404 }
    );
  }

  if (deposit.status === "SUCCESS") {
    return NextResponse.json({
      success: true,
      message: "Deposit already processed",
      data: { orderId: merchantOrderId, status: deposit.status },
    });
  }

  // Determine new status
  const newStatus = resultCode === "00" ? "SUCCESS" : "FAILED";

  await tx.deposits.update({
    where: { id: deposit.id },
    data: {
      status: newStatus,
      updatedAt: new Date(),
    },
  });

  if (newStatus === "SUCCESS") {
    await processSuccessfulDeposit(tx, deposit);
  }

  return NextResponse.json({
    success: true,
    message: `Deposit ${newStatus}`,
    data: {
      orderId: merchantOrderId,
      status: newStatus,
    },
  });
}

// Process membership callback
async function processMembershipCallback(tx: Prisma.TransactionClient, callbackData: CallbackData) {
  const { merchantOrderId, resultCode } = callbackData;
  
  // Find deposit record (assuming membership uses same table)
  const deposit = await tx.deposits.findFirst({
    where: { depositId: merchantOrderId },
  });

  if (!deposit) {
    return NextResponse.json(
      { success: false, message: "Membership order not found" },
      { status: 404 }
    );
  }

  // Check if already processed
  if (deposit.status === "SUCCESS") {
    return NextResponse.json({
      success: true,
      message: "Membership already processed",
      data: { orderId: merchantOrderId, status: deposit.status },
    });
  }

  // Determine new status
  const newStatus = resultCode === "00" ? "SUCCESS" : "FAILED";

  // Update status
  await tx.deposits.update({
    where: { id: deposit.id },
    data: {
      status: newStatus,
      updatedAt: new Date(),
    },
  });

  // Process successful membership upgrade
  if (newStatus === "SUCCESS") {
    await processSuccessfulMembership(tx, deposit);
  }

  return NextResponse.json({
    success: true,
    message: `Membership ${newStatus}`,
    data: {
      orderId: merchantOrderId,
      status: newStatus,
    },
  });
}

// Process successful deposit
async function processSuccessfulDeposit(tx: any, deposit: any) {
  // Get user data
  const user = await tx.users.findUnique({
    where: { username: deposit.username },
    select: {
      balance: true,
      whatsapp: true,
      username: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate final amount after fees
  let finalAmount = deposit.jumlah as number;
  if (deposit.metode === "QRIS ( All Payment )" || deposit.metode === "NQ") {
    const fee = Math.round(finalAmount * (0.7 / 100));
    finalAmount = finalAmount - fee;
  }

  const balanceBefore = user.balance;
  const balanceAfter = user.balance + finalAmount;

  // Insert balance history
  await tx.$queryRaw`
    INSERT INTO balance_histories (
      username,
      balance_change,
      balance_before,
      balance_after,
      change_type,
      description_detail,
      updated_at,
      created_at
    ) VALUES (
      ${deposit.username}, 
      ${finalAmount}, 
      ${balanceBefore}, 
      ${balanceAfter}, 
      ${"DEPOSIT"}, 
      ${`Deposit ${deposit.depositId} via ${deposit.metode}`}, 
      NOW(), 
      NOW()
    )
  `;

  // Update user balance
  await tx.users.update({
    where: { username: deposit.username },
    data: {
      balance: { increment: finalAmount },
    },
  });
}

// Process successful membership
async function processSuccessfulMembership(tx: any, deposit: any) {
  // Get user data
  const user = await tx.users.findUnique({
    where: { username: deposit.username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "Member" && deposit.jumlah >= 100000) {
    await tx.users.update({
      where: { username: deposit.username },
      data: { role: "Platinum" },
    });
  } else {
    await tx.users.update({
      where: { username: deposit.username },
      data: {
        balance: { increment: deposit.jumlah },
      },
    });
  }
}