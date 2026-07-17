import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

export async function shareCSV(content: string, fileName: string, dialogTitle: string) {
  const file = new File(Paths.cache, fileName);
  await file.write(content);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "text/csv",
      dialogTitle: dialogTitle,
      UTI: "public.comma-separated-values-text",
    });
  }
}

export async function sharePDF(html: string, fileName: string, dialogTitle: string) {
  const { uri: tmpUri } = await Print.printToFileAsync({ html, base64: false });
  const destFile = new File(Paths.cache, fileName);
  const tmpFile = new File(tmpUri);
  const pdfBytes = await tmpFile.bytes();
  await destFile.write(pdfBytes);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destFile.uri, {
      mimeType: "application/pdf",
      dialogTitle: dialogTitle,
      UTI: "com.adobe.pdf",
    });
  }
}
