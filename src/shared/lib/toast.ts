import { toast } from 'sonner-native'
import { getApiError } from './apiError'

export const showSuccess = (message: string) => toast.success(message)

export const showError = (error: unknown) =>
  toast.error(getApiError(error).message)

export const showMessage = (message: string) => toast(message)
