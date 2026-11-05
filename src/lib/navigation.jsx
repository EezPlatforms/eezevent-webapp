"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
export const RouterLink = ({to, ...props}) => <Link href={to || "/"} {...props}/>;
export const Navigate = ({to,replace}) => {
  const router=useRouter();
  useEffect(()=>{ if(replace) router.replace(to); else router.push(to); },[router,to,replace]);
  return null;
};
export const useNavigate = () => {
  const router=useRouter();
  return (to, options={})=>options.replace ? router.replace(to) : router.push(to);
};
export const useLocation = () => ({pathname:usePathname(),state:null});
export const useSearchParams = () => {
  const router=useRouter();
  const params=useNextSearchParams();
  const current=useMemo(()=>new URLSearchParams(params.toString()),[params]);
  const setParams=value=>{const next=new URLSearchParams(value);router.replace(next.toString()?"?"+next.toString():window.location.pathname);};
  return [current,setParams];
};
