export interface IGoogleMessagePartBody {
  attachmentId: string;
  size: number;
  data: string;
}

interface IGoogleMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: {
    name: string;
    value: string;
  };
  body: IGoogleMessagePartBody;
}

interface IGoogleEmailPayload extends IGoogleMessagePart {
  parts: Array<IGoogleMessagePart>
}

export interface IGoogleUser {}

export interface IGoogleEmail {
  id: string;
  threadId: string;
  labelIds: Array<string>;
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: IGoogleEmailPayload;
  sizeEstimate: number;
  raw: string;
}