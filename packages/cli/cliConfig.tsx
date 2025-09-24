import { WalrusClient } from "@mysten/walrus";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Command } from "commander";

const post = new Command();
const wallet = Ed25519Keypair.fromSecretKey(process.env.SUI_SECRET_KEY);

const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet')
});

const walrusClient = new WalrusClient({
    network: "testnet",
    suiClient
});


async function uploadPostsContent(content: string): Promise<string> {
    const fileBytes = new TextEncoder().encode(content);

    const { blobId, blobObject } = await walrusClient.writeBlob({
        blob: fileBytes,
        deletable: true,
        epochs: 4,
        signer: wallet,
    });

    console.log(`Uploaded with blobId: ${blobId}`);
    console.log(`Uploaded with blobObject: ${blobObject.id.id}`)
    return blobId;
}

async function createBlogPostMetaData(title: string, cid: string) {
    const metadata = {
        title,
        cid,
        author: wallet.getPublicKey(),
        timestamp: new Date().toISOString(),
    };
}

post.version('')
    .description('Decentralised Blog CLI');

post
    .command('create-post')
    .description('Creating a new blog post')
    .option('-t, --title <title>', 'Post title')
    .option('-c --content <content>', 'Post content')
    .action(async (options) => {
        const { title, content } = options;

        const cid = await uploadPostsContent(content);
        console.log()

        const response = await createBlogPostMetaData(title, cid);
        console.log('Blog post metadata created on SUI Blockchain:', response);
    });

post
    .command('view post')
    .description('Viewing a Blog Post')
    .option('-i, --cid<cid>', 'Content CID of the Post')
    .action(async (options) => {
        const { cid } = options;

        const content = await WalrusClient
        console.log('Post content for CID:', `${cid}, content: ${content}`)
    });


post.parse(process.argv);