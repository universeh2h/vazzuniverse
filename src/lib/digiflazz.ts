import axios, { AxiosError } from 'axios';
import crypto from 'crypto';

export class Digiflazz {
  private username: string;
  private apiKey: string;

  constructor(username: string, apiKey: string) {
    this.username = username;
    this.apiKey = apiKey;
  }

  async checkPrice() {
    try {
      const sign = crypto.createHash('md5').update(this.apiKey).digest('hex');

      const payload = {
        cmd: 'pricelist',
        username: this.username,
        sign: sign,
      };

      const response = await axios({
        method: 'POST',
        url: 'https://api.digiflazz.com/v1/price-list',
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Digiflazz price check error:', error.message);

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error(
              'Response data:',
              JSON.stringify(axiosError.response.data)
            );
            console.error('Response status:', axiosError.response.status);
            console.error('Response headers:', axiosError.response.headers);
          } else if (axiosError.request) {
            console.error('No response received:', axiosError.request);
          } else {
            console.error('Error setting up request:', axiosError.message);
          }
          console.error('Error config:', axiosError.config);
        }
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }

  async checkPricePrepaid() {
    try {
      const sign = crypto.createHash('md5').update(this.apiKey).digest('hex');

      const payload = {
        cmd: 'pricelist',
        username: this.username,
        sign: sign,
      };

      const response = await axios({
        method: 'POST',
        url: 'https://api.digiflazz.com/v1/price-list',
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Digiflazz price check error:', error.message);

        // Check if it's an Axios error with a response
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error(
              'Response data:',
              JSON.stringify(axiosError.response.data)
            );
            console.error('Response status:', axiosError.response.status);
            console.error('Response headers:', axiosError.response.headers);
          } else if (axiosError.request) {
            console.error('No response received:', axiosError.request);
          } else {
            console.error('Error setting up request:', axiosError.message);
          }
          console.error('Error config:', axiosError.config);
        }
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }

  async checkDeposit() {
    try {
      const sign = crypto
        .createHash('md5')
        .update(this.username + this.apiKey)
        .digest('hex');

      const payload = {
        cmd: 'deposit',
        username: this.username,
        sign: sign,
      };

      const response = await axios({
        method: 'POST',
        url: 'https://api.digiflazz.com/v1/cek-saldo',
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Digiflazz price check error:', error.message);

        // Check if it's an Axios error with a response
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error(
              'Response data:',
              JSON.stringify(axiosError.response.data)
            );
            console.error('Response status:', axiosError.response.status);
            console.error('Response headers:', axiosError.response.headers);
          } else if (axiosError.request) {
            // The request was made but no response was received
            console.error('No response received:', axiosError.request);
          } else {
            // Something happened in setting up the request
            console.error('Error setting up request:', axiosError.message);
          }
          console.error('Error config:', axiosError.config);
        }
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }
}
