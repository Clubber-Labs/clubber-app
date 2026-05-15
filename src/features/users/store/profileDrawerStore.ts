import { create } from 'zustand'

type ProfileDrawerState = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useProfileDrawer = create<ProfileDrawerState>(set => ({
  open: false,
  setOpen: open => set({ open }),
}))
