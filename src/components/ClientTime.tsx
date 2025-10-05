'use client';

import { useState, useEffect } from 'react';

export default function ClientTime() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="text-xs text-gray-400">系统运行中</span>;
  }

  return (
    <span className="text-xs text-gray-400">
      更新时间: {new Date().toLocaleTimeString()}
    </span>
  );
}
