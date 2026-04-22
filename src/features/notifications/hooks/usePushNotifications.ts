import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { notificationsService } from '../services/notificationsService'

export function usePushNotifications() {
  useEffect(() => {
    registerForPushNotifications()
  }, [])

  async function registerForPushNotifications() {
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') return

    const token = (await Notifications.getExpoPushTokenAsync()).data
    await notificationsService.registerToken(token)
  }
}
