import { TypographyPresets, createThemedStyleSheet, Colors } from 'etta-ui';

export const getPincodeStyles = createThemedStyleSheet((theme) => ({
  container: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  titleContainer: {
    marginTop: 76,
    marginHorizontal: 24,
  },
  title: {
    ...TypographyPresets.Header4,
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    ...TypographyPresets.Body4,
    textAlign: 'center',
    color: Colors.neutrals.light.neutral7,
    marginBottom: 30,
  },
  error: {
    ...TypographyPresets.Body4,
    color: theme.pincode.errorColor,
    textAlign: 'center',
    marginBottom: 24,
  },
  pincodeContainer: {
    marginBottom: 24,
    paddingHorizontal: '15%',
    alignItems: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    marginLeft: 24,
    marginRight: 24,
  },
  displayContainer: {
    flexDirection: 'row',
  },
  inputContainer: {
    flex: 1,
    height: TypographyPresets.Body1.lineHeight! * 1.14, // height should be equivalent to the line height of `char`
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    ...TypographyPresets.Body1,
  },
  dot: {
    width: 19,
    height: 19,
    borderRadius: 19 / 2,
    borderWidth: 1,
    borderColor: Colors.orange.base,
  },
  dotFilled: {
    backgroundColor: Colors.orange.base,
  },
}));
