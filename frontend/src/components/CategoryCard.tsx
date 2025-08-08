import Link from 'next/link';
import { SafeImage } from '@/components/SafeImage';
import { Category } from '@/store/api/categoryApi';

export const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Link href={`/products?category=${category._id}`} className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md no-underline">
      <div className="relative aspect-[4/2.5] w-full bg-gray-50">
        <SafeImage src={category.image} alt={category.name} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 md:text-base">{category.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 md:text-sm">{category.description}</p>
      </div>
    </Link>
  );
};


