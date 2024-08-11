import { toast } from "react-toastify";

export const resetNotification = () => toast("Table is reset to default.", { type: 'info' });
export const copyToClipboardNotification = () => toast("Link is copied to clipboard.", { type: 'success' });
export const deleteTemplateNotification = (name: string) => toast(`${name} template is removed.`, { type: 'warning' });
export const templateSavedNotification = (name: string) => toast(`${name} is saved.`, { type: 'success' });
export const templateLoadedNotification = (name: string) => toast(`You are viewing ${name} template.`, { type: 'info' });