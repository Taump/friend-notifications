const { isValidAddress } = require('ocore/validation_utils');

module.exports = async (deviceAddress, expectedWalletAddress, dataString) => {
    const validation = require('ocore/validation.js');

    if (typeof dataString !== 'string') {
        throw new Error('expected data to be a string');
    }

    if (!expectedWalletAddress || !isValidAddress(expectedWalletAddress)) {
        throw new Error('invalid expected wallet address');
    }

    const arrSignedMessageMatches = dataString.match(/\(signed-message:(.+?)\)/);

    if (!arrSignedMessageMatches || arrSignedMessageMatches.length < 2) throw new Error('Invalid format');

    const signedMessageBase64 = arrSignedMessageMatches[1];
    const signedMessageJson = Buffer.from(signedMessageBase64, 'base64').toString('utf8');
    let objSignedMessage;

    try {
        objSignedMessage = JSON.parse(signedMessageJson);
    } catch (err) {
        throw new Error('failed to parse signed message JSON');
    }

    return new Promise((resolve, reject) => {
        validation.validateSignedMessage(objSignedMessage, async err => {
            if (err) return reject({ error: 'signature validation failed' });

            if (!objSignedMessage.authors || objSignedMessage.authors.length === 0) {
                return reject({ error: 'validation failed' });
            }

            const { signed_message, authors: [{ address: senderWalletAddress }] } = objSignedMessage;

            try {
                const message = signed_message.trim();
                let data = {};

                const ghostName = message.trim().replace("choose ", "").replace(" as future friend", "").trim();

                data = {
                    name: ghostName,
                    address: senderWalletAddress
                };

                if (!ghostName || isValidAddress(senderWalletAddress) === false) {
                    return reject({ error: 'invalid message format' });
                } else if (expectedWalletAddress !== senderWalletAddress) {
                    return reject({ error: 'address in message does not match sender address' });
                }

                return resolve({ message, data, walletAddress: senderWalletAddress, deviceAddress });
            } catch (err) {
                console.error('error in signed message:', err);
                reject({ error: 'unknown error! Please try again.' });
            }
        });
    });
}