"use client";

const notifications = [
  {
    id: 1,
    title: "Upgrade Required",
    description:
      "Without a Pro plan, you can't access the Tools. Upgrade to Pro to unlock all features!",
    type: "warning",
  },
  // Add more notifications here if needed
];

export default function NotificationsPage() {
  return (
    <div className="h-full w-full bg-background">
      <h1 className="text-2xl font-bold mb-4 mx-4">Notifications</h1>
      <ul className="space-y-4 mx-4">
        {notifications.map((n) => (
          <li
            key={n.id}
            className="flex flex-col items-start rounded bg-card border border- p-4"
          >
            <h3 className="text-lg font-bold">{n.title}</h3>
            <p className="text-sm text-muted-foreground">{n.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
