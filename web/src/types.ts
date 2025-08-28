export type Profile = {
  id: string;
  profileId: string;
  username: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  country: string;
  mobile: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProfileRequest = {
  username: string;
  firstName: string;
  lastName: string;
  birthday?: string | null; // yyyy-MM-dd
  country: string;
  mobile?: string | null;
  email: string;
  password: string; // plain on client; server hashes with BCrypt
};