import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Space Race · Planet Adventures',description:'Fly through Moon, Mars, Jupiter and Saturn levels. Dodge obstacles and discover each world at your own pace.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>;}
