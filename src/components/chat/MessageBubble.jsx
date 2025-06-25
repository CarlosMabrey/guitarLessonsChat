'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

const MessageBubble = ({ children, isAi, isTyping, timestamp }) => {
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }) : null;

  return (
    <div className="relative group">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          'inline-block px-4 py-3 text-sm leading-relaxed relative',
          isAi
            ? 'bg-card-hover/70 text-text-primary rounded-2xl rounded-tl-none'
            : 'bg-primary/15 text-text-primary rounded-2xl rounded-tr-none',
          isTyping ? 'min-w-[100px]' : '',
          'shadow-sm hover:shadow transition-shadow duration-200'
        )}
      >
        {isTyping ? (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-text-secondary">Typing...</span>
          </div>
        ) : (
          <>
            {children}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MessageBubble;

// const MessageBubble = ({ children, isAi, isTyping, timestamp }) => {
//   // Format the timestamp if provided
//   const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { 
//     hour: '2-digit', 
//     minute: '2-digit' 
//   }) : null;

//   return (
//     <div className="relative group">
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.2 }}
//         className={clsx(
//           'inline-block px-4 py-3 text-sm leading-relaxed relative',
//           isAi 
//             ? 'bg-card-hover/70 text-text-primary rounded-2xl rounded-tl-none' 
//             : 'bg-primary/15 text-text-primary rounded-2xl rounded-tr-none',
//           isTyping ? 'min-w-[100px]' : '',
//           'shadow-sm hover:shadow transition-shadow duration-200'
//         )}
//       >
//         {isTyping ? (
//           <div className="flex items-center space-x-2">
//             <div className="flex space-x-1">
//               <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0ms' }} />
//               <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }} />
//               <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
//             </div>
//             <span className="text-xs text-text-secondary">Typing...</span>
//           </div>
//         ) : (
//           <>
//             {children}
//           </>
//         )}
//       </motion.div>
//     </div>
//   );
// };