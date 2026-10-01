import React, { useState, useEffect } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../utils/axiosInstance";

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      try {
        const response = await axiosInstance.get(
          `/api/notifications/student/${user.id}`
        );
        if (response.status === 200) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Notifications
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <Alert
                key={index}
                color="blue"
                icon={
                  <InformationCircleIcon strokeWidth={2} className="h-6 w-6" />
                }
              >
                <strong>{notification.title}</strong>: {notification.message}
              </Alert>
            ))
          ) : (
            <Typography>No notifications available.</Typography>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;
