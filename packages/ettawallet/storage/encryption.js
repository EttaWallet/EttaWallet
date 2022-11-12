import { AES, enc } from 'crypto-js';

export function encrypt(data, password) {
  if (data.length < 10) throw new Error('data length cant be < 10');
  const ciphertext = AES.encrypt(data, password);
  return ciphertext.toString();
}

export function decrypt(data, password) {
  const bytes = AES.decrypt(data, password);
  let str = false;
  try {
    str = bytes.toString(enc.Utf8);
  } catch (e) {}

  // for some reason, sometimes decrypt would succeed with incorrect password and return random couple of characters.
  // at least in nodejs environment. so with this little hack we are not alowing to encrypt data that is shorter than
  // 10 characters, and thus if decrypted data is less than 10 characters we assume that decrypt actually failed.
  if (str.length < 10) return false;

  return str;
}
