import { type } from '@generated/site-storage';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const signatureBytes: number[] = [/* your signature bytes here */];
const uint8Signature = new Uint8Array(signatureBytes);
const base64Signature = Buffer.from(uint8Signature).toString('base64');

const tx = new Transaction();

const bytes = await tx.build();

const providers = new SuiClient({
    url: getFullnodeUrl('testnet')
});

const wallet = Ed25519Keypair.fromSecretKey('');

async function createBlogPostData(title: string, cid: string) {
    const metadata = {
        title,
        cid,
        author: wallet.getPublicKey(),
        timestamp: new Date().toISOString(),
    };

    // const transact = await providers.executeTransactionBlock({
    //     transactionBlock: bytes,
    //     signature: base64Signature,
    // });

    const signedTx  = await providers.signAndExecuteTransaction({
        transaction: metadata,
        signer: wallet,
    });

    const response = await providers.executeTransactionBlock({
        transactionBlock: signedTx.rawTransaction,
        signature: base64Signature,
    });
    return response;
}