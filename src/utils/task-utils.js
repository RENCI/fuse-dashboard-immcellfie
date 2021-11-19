export const taskUtils = {
  isActive: status => {
    return status === "submitting" || status === "queued" || status === "started";
  }
}