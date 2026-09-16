// 1. Request permission from the OS when the user logs in
function setupAlarmSystem() {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notifications.");
        return;
    }

    if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                console.log("Desktop alarms enabled!");
            }
        });
    }
}

// 2. The function to trigger the alarm
function fireLessonAlarm(title, message) {
    if (Notification.permission === "granted") {
        // Create the audio object
        const alarmSound = new Audio('/assets/sounds/alarm.mp3'); 
        
        // Loop the sound so it acts like a real alarm
        alarmSound.loop = true; 
        alarmSound.play();

        // Trigger the native Windows/macOS notification
        const notification = new Notification(title, {
            body: message,
            icon: '/assets/images/lesson-notify-icon.png',
            requireInteraction: true // VERY IMPORTANT: Keeps the notification on screen until clicked
        });

        // When the user clicks the notification to dismiss it
        notification.onclick = () => {
            window.focus(); // Brings your app to the front
            alarmSound.pause(); // Stops the ringing
            alarmSound.currentTime = 0; // Resets the audio
            notification.close();
        };
    } else {
        alert("Alarm missed! Please enable desktop notifications for Lesson Notify.");
    }
}

// Example usage: Call setup on page load
setupAlarmSystem();

// Example usage: Triggering an alarm 5 minutes before class
// fireLessonAlarm("Upcoming Class!", "Intro to UI/UX Design starts in 5 minutes.");