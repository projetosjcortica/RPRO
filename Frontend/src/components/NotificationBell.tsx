import { useState } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotifications, NotificationType } from '../hooks/useNotifications';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeStyles: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-green-50', border: 'border-l-green-500', icon: 'text-green-600' },
  error: { bg: 'bg-red-50', border: 'border-l-red-500', icon: 'text-red-600' },
  warning: { bg: 'bg-yellow-50', border: 'border-l-yellow-500', icon: 'text-yellow-600' },
  info: { bg: 'bg-blue-50', border: 'border-l-blue-500', icon: 'text-blue-600' },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="font-semibold text-sm text-gray-800">Notificações</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Ler todas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Limpar todas"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Lista de notificações */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-10 w-10 mb-3 text-gray-300" />
              <span className="text-sm">Nenhuma notificação</span>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const styles = typeStyles[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'relative px-4 py-3 cursor-pointer transition-colors border-l-4',
                      styles.border,
                      notification.read ? 'bg-white' : styles.bg,
                      'hover:bg-gray-50'
                    )}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn('font-medium text-sm', notification.read ? 'text-gray-700' : 'text-gray-900')}>
                            {notification.title}
                          </span>
                          {notification.count > 1 && (
                            <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                              x{notification.count}
                            </span>
                          )}
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="mt-0.5 text-xs text-gray-500 truncate">
                            {notification.message}
                          </p>
                        )}
                        <span className="mt-1 text-[10px] text-gray-400">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
