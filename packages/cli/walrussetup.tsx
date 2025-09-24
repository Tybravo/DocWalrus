import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";


const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet')
});

const walrusClient = new WalrusClient({
    network: "testnet",
    suiClient
});

const blobs = await walrusClient.getBlob({ blobId });

const files = await blobs.files();

async function uploadPostsToContent(content: string): Promise<String> {
    const { cid } = await walrusClient.writeBlob(content);
    return cid;
}