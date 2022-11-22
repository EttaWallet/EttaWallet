import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Pagination from './Pagination';
import variables from '../styles/variables';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import colors from '../styles/colors';

interface Notification {
  element: React.ReactElement;
  priority: number;
  id: string;
}

function useNotifications() {
  const { t } = useTranslation();
  const notifications: Notification[] = [];

  // just a sample of how this will work
  notifications.push({
    element: <Text>Backup</Text>,
    priority: 500,
    id: 'backup',
  });

  notifications.push({
    element: <Text>Incoming transaction</Text>,
    priority: 1000,
    id: 'incomingPayment',
  });

  return notifications.sort((n1, n2) => n2.priority - n1.priority);
}

const SuggestionBox = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastViewedIndex = useRef(-1);
  const notifications = useNotifications();

  const handleScroll = (event: { nativeEvent: NativeScrollEvent }) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / variables.width
    );

    if (nextIndex === currentIndex) {
      return;
    }

    setCurrentIndex(
      Math.round(event.nativeEvent.contentOffset.x / variables.width)
    );
  };

  useEffect(() => {
    if (notifications.length > 0 && lastViewedIndex.current < currentIndex) {
      lastViewedIndex.current = currentIndex;
    }
  }, [currentIndex]);

  if (!notifications.length) {
    // No notifications, no slider
    return null;
  }

  return (
    <View style={styles.body}>
      <ScrollView
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
      >
        {notifications.map(notification => (
          <Card key={notification.id} style={styles.notificationContainer}>
            {notification.element}
          </Card>
        ))}
      </ScrollView>
      <Pagination
        style={styles.pagination}
        count={notifications.length}
        activeIndex={currentIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    maxWidth: variables.width,
  },
  notificationContainer: {
    width: variables.width - 2 * variables.contentPadding,
    marginBottom: 24,
    backgroundColor: colors.greenFaint,
  },
  pagination: {
    paddingBottom: variables.contentPadding,
  },
});

export default SuggestionBox;
