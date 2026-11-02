export type EventRow = {
  id: string;
  name: string;
  first_photo_uploaded_at: string | null;
  deadline_at: string | null;
  deadline_overridden: boolean;
  created_at: string;
};

export type PhotoRow = {
  id: string;
  event_id: string;
  storage_path_display: string;
  storage_path_thumb: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type DownloadRow = {
  id: string;
  photo_id: string;
  guest_name: string;
  downloaded_at: string;
  user_agent: string | null;
};

export type Database = {
  public: {
    Tables: {
      event: {
        Row: EventRow;
        Insert: Partial<EventRow>;
        Update: Partial<EventRow>;
      };
      photos: {
        Row: PhotoRow;
        Insert: Omit<PhotoRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<PhotoRow>;
      };
      downloads: {
        Row: DownloadRow;
        Insert: Omit<DownloadRow, "id" | "downloaded_at"> & {
          id?: string;
          downloaded_at?: string;
        };
        Update: Partial<DownloadRow>;
      };
    };
  };
};
