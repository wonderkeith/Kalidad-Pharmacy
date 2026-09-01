import { watchAuth, getUserProfile } from "./auth.js";
export function requireCustomer(redirect="../store/login.html"){return watchAuth(async user=>{if(!user){location.replace(redirect);return}return user;});}
export function requireAdmin(redirect="./login.html"){return watchAuth(async user=>{if(!user){location.replace(redirect);return}const p=await getUserProfile(user.uid);const ok=p&&["admin","superadmin","staff"].includes(p.role)&&p.active!==false;if(!ok)location.replace("../store/index.html");return ok?p:null;});}
