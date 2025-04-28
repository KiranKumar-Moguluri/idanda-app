// utils/errorHandler.ts
import { Alert } from 'react-native';

/**
 * Reusable error handling function.
 * 
 * This safely handles errors caught in try-catch blocks across the app.
 * 
 * @param error - The caught error (TypeScript treats this as unknown).
 * @param context - A custom message or title to show in the alert (e.g., 'Login Failed', 'Post Failed').
 */
export const showError = (error: unknown, context: string = 'Error') => {
  if (error instanceof Error) {
    // ✅ If it's a proper Error object, show its message
    Alert.alert(context, error.message);
  } else if (typeof error === 'string') {
    // Optional: If someone throws a string (not recommended), handle that too
    Alert.alert(context, error);
  } else {
    // Fallback: Unknown error type
    Alert.alert(context, 'An unknown error occurred.');
  }
};
