// types/index.ts

interface Product {
    name: string;
    description: string;
    active: boolean;
  }
  
  export interface Plan {
    id: string;
    product: Product;
    currency: string;
    
    unit_amount: number | null;
  }
  