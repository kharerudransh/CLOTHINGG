import ImageKit, { toFile } from "@imagekit/nodejs";
import { CONFIG } from "../config/config.js";

const imagekit = new ImageKit({
    privateKey: CONFIG.ImageKit_Private_Key,  
});

export async function uploadFile({ buffer, fileName, folder = "snitch" }) {
    try {
        const file = await toFile(buffer, fileName);
        const result = await imagekit.files.upload({
            file,
            fileName,
            folder,
        });
        return result;
    } catch (error) {
        throw error;
    }
}