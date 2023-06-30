import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import * as React from 'react';
import { useState } from 'react';
import { SectionList, SectionListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { IContactSection, TContact } from '../utils/types';
import ContactItem from './ContactItem';
import KeyboardSpacer from './keyboard/KeyboardSpacer';
import useContactsBottomSheet from './useContactsBottomSheet';

interface Props {
  searchQuery: string;
  sections: IContactSection[];
}

const ContactsList = (props: Props) => {
  const { openNewContactSheet, NewContactBottomSheet } = useContactsBottomSheet({});
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const onToggleKeyboard = (visible: boolean) => {
    setKeyboardVisible(visible);
  };

  const renderItem = ({ item }: SectionListRenderItemInfo<TContact, IContactSection>) => {
    return <ContactItem contact={item} key={item.id} />;
  };

  const keyExtractor = (item: TContact, index: number) => {
    return item.id + index;
  };

  const renderItemSeparator = () => <View style={styles.separator} />;

  const renderNoContactsView = () => (
    <View style={styles.emptyView}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: Colors.purple.base,
          },
        ]}
      >
        <Icon name="icon-contacts-2" style={styles.icon} />
      </View>
      <Text style={styles.emptyTitle}>Add your first contact</Text>
      <Text style={styles.emptyText}>
        Send and receive more easily, and keep your payments well organized.
      </Text>
      <View style={styles.btnContainer}>
        <Button title="Add contact" style={styles.button} onPress={openNewContactSheet} />
      </View>
    </View>
  );

  const buildSections = (defaultSections: IContactSection[]) => {
    return defaultSections;
  };
  return (
    <View style={styles.body}>
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <SectionList
            contentContainerStyle={[
              styles.content,
              !isKeyboardVisible &&
                insets && {
                  paddingBottom: insets.bottom,
                },
            ]}
            renderItem={renderItem}
            sections={buildSections(props.sections)}
            ItemSeparatorComponent={renderItemSeparator}
            ListEmptyComponent={renderNoContactsView()}
            keyExtractor={keyExtractor}
            initialNumToRender={30}
            keyboardShouldPersistTaps="always"
          />
        )}
      </SafeAreaInsetsContext.Consumer>
      <KeyboardSpacer onToggle={onToggleKeyboard} />
      {NewContactBottomSheet}
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.neutrals.light.neutral4,
  },
  emptyStateBody: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral4,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyView: {
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  emptyTitle: {
    ...TypographyPresets.Header5,
    textAlign: 'center',
    paddingBottom: 10,
  },
  emptyText: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
    textAlign: 'center',
  },
  icon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 30,
    color: Colors.common.white,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 50,
    marginBottom: 20,
  },
  btnContainer: {
    marginTop: 24,
  },
  button: {
    justifyContent: 'center',
  },
});

export default ContactsList;
