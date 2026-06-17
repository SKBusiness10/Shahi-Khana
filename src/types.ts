export interface MenuItem {
  id: string;
  name: string;
  nameUrdu: string;
  description: string;
  priceHalf?: number;
  priceFull: number;
  hasHalfOption: boolean;
  category: 'breakfast' | 'bread' | 'dairy' | 'beverages';
  isSpecialty?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BusinessInfo {
  name: string;
  type: string;
  address: string;
  phone: string;
  phoneRaw: string;
  coordinates: {
    lat: number;
    lng: number;
    text: string;
  };
  mapsUrl: string;
  hours: string;
  rating: number;
  reviewCount: number;
}
