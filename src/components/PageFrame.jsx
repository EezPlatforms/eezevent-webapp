"use client";
import AppShell from "./AppShell";
export default function PageFrame({children, contentSx}) { return <AppShell contentSx={contentSx}>{children}</AppShell>; }
