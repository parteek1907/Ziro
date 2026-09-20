import { useState, useEffect } from "react";

export function RelativeTime({ timeStr }: { timeStr: string }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const updateTime = () => {
      let date: Date;
      try {
        date = new Date(timeStr);
        if (isNaN(date.getTime())) throw new Error();
      } catch {
        setDisplay(timeStr); // fallback if it's not a valid date string
        return;
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) {
        setDisplay("Just now");
      } else if (diffMins < 60) {
        setDisplay(`${diffMins} min ago`);
      } else if (diffHours < 24) {
        setDisplay(`${diffHours} hr${diffHours > 1 ? "s" : ""} ago`);
      } else if (diffDays === 1) {
        setDisplay("1 day ago");
      } else {
        setDisplay(`${diffDays} days ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [timeStr]);

  return <span>{display || timeStr}</span>;
}
