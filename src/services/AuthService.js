const API_BASE_URL = 'http://localhost:3000/api';

export class AuthService {
  static async sendOTP(phoneNumber) {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      throw new Error('Failed to send OTP');
    }

    return response.json();
  }

  static async verifyOTP(phoneNumber, otp) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, otp }),
    });

    if (!response.ok) {
      throw new Error('Invalid OTP');
    }

    const data = await response.json();
    
    // Store token for future requests
    this.token = data.token;
    
    return data.user;
  }

  static getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  static async checkUserExists(phoneNumber) {
    const response = await fetch(`${API_BASE_URL}/users/check/${phoneNumber}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check user');
    }

    return response.json();
  }
}