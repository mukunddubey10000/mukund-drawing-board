import { useState } from "react";

const useNotification = () => {
    //start using normal CSS. Tailwind wagera baad mei karna
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState("");

    const triggerNotification = ({ duration, message }) => {
        setMessage(message);
        setTimeout(() => {
            setIsVisible(false);
        }, duration);
    }

    const Notification = !isVisible ? null : (
        <div className="notification-container" style={{ zIndex: 999, position: "absolute", height: '100vh', width: '10vw', backgroundColor: 'red' }}>
            {message}
        </div>
    );

    return { Notification, triggerNotification };
}

export default useNotification;