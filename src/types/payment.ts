export interface PaymentError {
  code: string;
  message: string;
  decline_code?: string;
}

export interface ApplicationFormError {
  type: 'payment' | 'upload' | 'validation' | 'submission';
  message: string;
}
