import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    username: "游客",
  }),
  actions: {
    setUsername(name: string) {
      this.username = name;
    },
  },
});
