/**
 * v0 by Vercel.
 * @see https://v0.dev/t/6h3SyNbH9e8
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { useState, useMemo, useEffect } from "react"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { useForm } from 'react-hook-form';

import { CiMenuKebab } from "react-icons/ci";

import { useRouter } from 'next/router';

import { MdKeyboardArrowDown } from "react-icons/md";
import { LuPackagePlus } from "react-icons/lu";
import { TrashIcon } from "@heroicons/react/24/outline"
import { GrUpdate } from "react-icons/gr";



import SelectTest, { OptionsOrGroups, GroupBase } from 'react-select';
import makeAnimated from 'react-select/animated';

import { TbArrowMoveRight } from "react-icons/tb";

import { useTranslation } from 'next-i18next';
import toast from "react-hot-toast"

import { LuClipboardSignature } from "react-icons/lu";

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

export default function Component() {
  const router = useRouter();
  const { slug } = router.query;
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("productCode")
  const [sortDirection, setSortDirection] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const { t } = useTranslation('common');
  const animatedComponents = makeAnimated();
  interface subcategory {
    id: string;
    name: string;
    createdAt: string;
  }
  interface Category {
    id: string;
    name: string;
    createdAt: string;
  }
  interface Category_Product {
    id: string;
    createdAt: string;

    category: Category;

    Category_SubCategory_Product: {
      id: string;
      createdAt: string;
      category_subcategory: {
        id: string;
        createdAt: string;
        subcategory: subcategory;
      };
    }[];
  }
  interface Inventory {
    id: string;
    name: string;
    imageUrl: string;
    code: string;
    description: string;
    purchasePrice: string;
    salePrice: string;
    stockQuant: number;
    supplier: string;
    unitOfMeasure: string;
    createdAt: string;
    Category_Product: Category_Product[];
  }

  type OnlyCategory = {
    id: string;
    name: string;
  }

  type OnlySubCategory = {
    id: string;
    name: string;
  }

  type OnlyCadSubCategory = {
    id: string;
    subcategory: {
      id: string;
      name: string;
    };
  };

  type Option = {
    value: string;
    label: string;
  };

  const [inventory, setInventory] = useState<Inventory[]>([
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');

  const [chooseCategory, setChooseCategory] = useState('');
  const [chooseSubCategory, setChooseSubCategory] = useState('');

  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  const [inputCategoria, setInputCategoria] = useState('');

  const [inputSubCategoria, setInputSubCategoria] = useState('');

  const [category, setCategory] = useState<OnlyCategory[]>([]);

  const [subCategory, setSubCategory] = useState<OnlySubCategory[]>([]);

  const [subCategoryOnCategory, setSubCategoryOnCategory] = useState<OnlyCadSubCategory[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const [formCategoriaId, setFormCategoriaId] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Inventory | null>(null);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSheetUpdateOpen, setIsSheetUpdateOpen] = useState(false);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '',
      borderColor: state.isFocused ? 'grey' : '#191f38',
      color: '#000000',  // Cor do texto dentro do controle  
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#f2f1f1' : state.isFocused ? '#f0f0f0' : '#fff',
      color: state.isSelected ? '#000000' : '#000',
      fontSize: '16px',  // Tamanho da fonte das opções  
      fontWeight: 600,
      cursor: 'pointer',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#888888',  // Cor do placeholder  
      fontSize: '16px',  // Tamanho da fonte do placeholder (opcional)  
      fontWeight: 400,   // Peso da fonte do placeholder (opcional)  
    }),
  };

  const getSortableValue = (item, column) => {
    switch (column) {
      case 'productCode':
        return item.code;
      case 'productName':
        return item.name;
      case 'category':
        return item.Category_Product[0]?.category.name || '';
      case 'subCategory':
        return item.Category_Product[0]?.Category_SubCategory_Product[0]?.category_subcategory.subcategory.name || '';
      case 'description':
        return item.description;
      case 'stockQuantity':
        return item.stockQuant;
      case 'unitOfMeasure':
        return item.unitOfMeasure;
      case 'purchasePrice':
        return item.purchasePrice;
      case 'salePrice':
        return item.salePrice;
      case 'supplier':
        return item.supplier;
      default:
        return '';
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(item => selectedCategory === 'all' || item.Category_Product.some(catProd => catProd.category.name === selectedCategory))
      .filter(item => selectedSubCategory === 'all' || item.Category_Product.some(catProd =>
        catProd.Category_SubCategory_Product.some(catSubCatProd =>
          catSubCatProd.category_subcategory.subcategory.name === selectedSubCategory
        )
      ));
  }, [inventory, searchTerm, selectedCategory, selectedSubCategory]);

  const sortedInventory = useMemo(() => {
    if (!sortColumn) return filteredInventory;
    return [...filteredInventory].sort((a, b) => {
      const aValue = getSortableValue(a, sortColumn);
      const bValue = getSortableValue(b, sortColumn);
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredInventory, sortColumn, sortDirection]);

  const paginatedInventory = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedInventory.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedInventory, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const setPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  }

  const ProductSchema = Yup.object().shape({
    code: Yup.string(),
    name: Yup.string().required('Por favor preencha este campo'),
    category: Yup.string(),
    description: Yup.string(),
    stockQuant: Yup.number()
      .typeError('Por favor preencha com um número')
      .required('Por favor preencha este campo')
      .moreThan(0, 'O número deve ser maior que 0')
      .test(
        'no-hyphen',
        'O número não deve conter hífens',
        value => !String(value).includes('-')
      ),
    unitOfMeasure: Yup.string(),
    purchasePrice: Yup.string()
      .matches(/^\d+(?:,\d{1,2})?$/, 'Formato inválido. Use vírgula para separar decimais')
      .test('is-decimal', 'Valor inválido', value => {
        if (!value) return true
        const numberValue = Number(value.replace(',', '.'))
        return !isNaN(numberValue) && numberValue > 0
      }),
    salePrice: Yup.string()
      .matches(/^\d+(?:,\d{1,2})?$/, 'Formato inválido. Use vírgula para separar decimais')
      .test('is-decimal', 'Valor inválido', value => {
        if (!value) return true
        const numberValue = Number(value.replace(',', '.'))
        return !isNaN(numberValue) && numberValue > 0
      })
      .required('O Preço de venda do produto é obrigatório'),
    supplier: Yup.string(),
    imageUrl: Yup.string(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(ProductSchema),
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/teams/${slug}/inventory/categories`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });
      //console.log('response:', response)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();


      if (Array.isArray(data.categories)) {
        setCategory(data.categories);
      } else {

        console.error('Expected an array but got:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await fetch(`/api/teams/${slug}/inventory/subcategories`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();


      if (Array.isArray(data.subCategories)) {
        setSubCategory(data.subCategories);
      } else {

        console.error('Expected an array but got:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar Subcategorias:', error);
    }
  };

  const fetchSubCategoriesInCategories = async () => {
    console.log(formCategoriaId)
    setIsLoading(true);
    setSelectedOptions([]);
    if (!formCategoriaId) {
      toast.error('Por favor selecione uma categoria primeiro')
    }
    try {
      const response = await fetch(`/api/teams/${slug}/inventory/categories/${formCategoriaId}/subcategories`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        console.log(await response.json())
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      if (Array.isArray(data.subcategories)) {
        setSubCategoryOnCategory(data.subcategories);
        setIsLoading(false);
      } else {

        console.error('Expected an array but got:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar Subcategorias:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/teams/${slug}/inventory/products`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();


      if (Array.isArray(data.inventoryProducts)) {
        setInventory(data.inventoryProducts)

      } else {

        console.error('Expected an array but got:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar Subcategorias:', error);
    }
  };

  const [selectedSubcategoryOptions, setSelectedSubcategoryOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (selectedProduct?.Category_Product) {
      const options = selectedProduct.Category_Product.flatMap(categoryProduct =>
        categoryProduct.Category_SubCategory_Product.map(subcategoryProduct => ({
          label: subcategoryProduct.category_subcategory.subcategory.name,
          value: subcategoryProduct.category_subcategory.subcategory.id
        }))
      );
      console.log('subcategorias', options)
      setSelectedSubcategoryOptions(options);
    } else {
      setSelectedSubcategoryOptions([]);
    }
  }, [selectedProduct, isSheetUpdateOpen]);

  useEffect(() => {

    if (slug) {
      fetchCategories();
      fetchSubCategories();
      fetchProducts();
    }
    if (selectedProduct) {
      reset(selectedProduct);
    }

  }, [slug, selectedProduct, reset]);

  const handleUpdateClick = (item) => {
    console.log('atualizando', item.name);
    setSelectedProduct(item);
    setFormCategoriaId(item.Category_Product.map(categoria => categoria.category.id));
  };

  const onAddCategory = async () => {
    console.log('adicionado', inputCategoria);
    if (!inputCategoria.trim()) {
      toast.error('O nome da categoria não pode estar vazio');
      return;
    }

    try {
      const response = await fetch(`/api/teams/${slug}/inventory/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: { name: inputCategoria } }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Já existe uma categoria com este nome');
          return;
        }
        throw new Error('Erro ao adicionar categoria');
      }


      toast.success('Categoria criada!')
      setInputCategoria('')
      fetchCategories()
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }

    // Reset form after submission  
  };

  const onAddSubCategory = async () => {

    console.log(inputSubCategoria);

    if (!inputSubCategoria.trim()) {
      toast.error('O nome da subcategoria não pode estar vazio');
      return;
    }

    try {
      const response = await fetch(`/api/teams/${slug}/inventory/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subcategory: { name: inputSubCategoria } }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar Subcategoria');
      }


      toast.success('Subcategoria criada!')
      setInputSubCategoria('')
      fetchSubCategories()
    } catch (error) {
      console.error('Erro ao adicionar Subcategoria:', error);
    }


  };

  const onAddCategoryOnSubCategory = async () => {

    console.log('id da Categoria', chooseCategory);
    console.log('id da SubCategoria', chooseSubCategory);

    if (!chooseCategory || !chooseSubCategory) {
      toast.error('Por favor, selecione uma categoria e uma subcategoria');
      return;
    }


    try {
      const response = await fetch(`/api/teams/${slug}/inventory/categories/${chooseCategory}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subCategoryId: chooseSubCategory }),
      });

      if (!response.ok) {
        // console.log(response)
        throw new Error('Erro ao adicionar Categoria em Subcategoria');
      }


      toast.success('Subcategoria atribuida!')
    } catch (error) {
      console.error('Erro ao adicionar Categoria em Subcategoria:', error);
    }

    setChooseCategory('')
    setChooseSubCategory('')
  };

  const onSubmit = async (data) => {
    console.log(data);
    const subcategoryValues = selectedOptions.map(option => option.value);
    const product = {
      code: data.code,
      name: data.name,
      description: data.description,
      stockQuant: Number(data.stockQuant),
      unitOfMeasure: data.unitOfMeasure,
      purchasePrice: data.purchasePrice,
      salePrice: data.salePrice,
      supplier: data.supplier,
      imageUrl: data.imageUrl,
    };
    const body = {
      product: product,
      categoryId: formCategoriaId,
      category_subcategories: subcategoryValues,
    };
    console.log("Dados:", JSON.stringify(body, null, 2));

    if(!formCategoriaId){
      toast.error('Por favor escolha uma categoria')
      return;
    }

    try {
      const response = await fetch(`/api/teams/${slug}/inventory/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Log the response to debug  
      console.log("Response:", response);

      if (response.status === 403) {
        toast.error('Já existe um Produto com este código!');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      toast.success("Produto adicionado com sucesso!");
      fetchProducts();
      reset();
      setFormCategoriaId('');
      setIsSheetOpen(false);

    } catch (error) {
      console.error("Erro ao adicionar o produto:", error);
      toast.error('Falha ao tentar adicionar um produto!');
    }
  };

  const handleValueChange = (selected) => {
    setSelectedOptions(selected);
    console.log('Opções selecionadas:', selected);
  };

  const onUpdateSuccess = () => {
    setIsSheetUpdateOpen(false);
    fetchProducts()
    
  };

  const onUpdate = async (data) => {
    try {
      const product = {
        code: data.code,
        name: data.name,
        description: data.description,
        stockQuant: Number(data.stockQuant),
        unitOfMeasure: data.unitOfMeasure,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        supplier: data.supplier,
        imageUrl: data.imageUrl,
      };

      const categoryId = selectedCategoryOptions[0].value != formCategoriaId ? formCategoriaId : selectedCategoryOptions[0].value;
      const subCategoryIds = selectedSubcategoryOptions.map(subcat => subcat.value) != selectedSubcategoryOptions.map(subcat => subcat.value) ? selectedOptions.map(option => option.value) : selectedSubcategoryOptions.map(subcat => subcat.value);

      const body = {
        ...product,
        categoryId: categoryId,
        category_subcategories: subCategoryIds,
      };

      console.log(body);

      const response = await fetch(`/api/teams/${slug}/inventory/products/${selectedProduct?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log("Response:", await response.json());

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }

      toast.success('Produto atualizado com sucesso!');
      onUpdateSuccess();
      reset();
    } catch (error) {
      toast.error('Erro ao atualizar o produto');
    }
  };

  const handleDelete = async (productId) => {
    console.log(productId)
    try {
      const response = await fetch(`/api/teams/${slug}/inventory/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove the product from the local state  
        const updatedInventory = inventory.filter(item => item.code !== productId);
        setInventory(updatedInventory);
        toast.success('Produto excluido com sucesso!');
        fetchProducts()
      } else {
        // Handle error response  
        toast.error('Failed to delete the product');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const getCategoryName = (value) => {
    if (value === 'all') return t('Todas Categorias');
    const foundCategory = category.find(categoria => categoria.name === value);
    return foundCategory ? t(foundCategory.name) : t('Selecione uma Categoria');
  };

  const getSubCategoryName = (value) => {
    if (value === 'all') return t('Todas as SubCategorias');
    const foundSubCategory = subCategory.find(subCategoria => subCategoria.name === value);
    return foundSubCategory ? t(foundSubCategory.name) : t('Selecione uma SubCategoria');
  };

  const deleteCategory = async (id) => {
    console.log(id)
    try {
      const response = await fetch(`/api/teams/${slug}/inventory/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {

        setCategory(category.filter(categoria => categoria.id !== id));
        if (selectedCategory === id) {
          setSelectedCategory('all');
        }
        toast.success('Categoria excluída com sucesso!');
        fetchCategories()
        setSelectedCategory('all')
      } else {
        toast.error('Falha ao excluir a categoria');
      }
    } catch (error) {
      console.error('Erro ao excluir a categoria:', error);
    }
  };

  const deleteSubCategory = async (id) => {

    try {
      const response = await fetch(`/api/teams/${slug}/inventory/subcategories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('SubCategoria excluída com sucesso!');
        setSubCategory(subCategory.filter(subCategoria => subCategoria.id !== id));

        if (selectedSubCategory === id) {
          setSelectedSubCategory('all'); // Certifique-se de usar a função correta para atualizar o estado  
        }
        toast.success('SubCategoria excluída com sucesso!');
        fetchSubCategories()
        setSelectedSubCategory('all')
      } else {
        console.error('Falha ao excluir a SubCategoria:', response.statusText);
        toast.error('Falha ao excluir a SubCategoria');
        console.log('subcategory id:', id);
      }
    } catch (error) {
      console.error('Erro ao excluir a SubCategoria:', error);
    }
  };

  const categoryOptions: OptionsOrGroups<Option, GroupBase<Option>> = category
    ? category.map((categoria) => ({
      label: categoria.name,
      value: categoria?.id,
    }))
    : [];

  const selectedCategoryOptions = selectedProduct?.Category_Product.map(categoria => ({
    label: categoria.category.name,
    value: categoria.category.id
  })) || [];


  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold">{t('Gerenciador de Estoque')}</h1>
      <div className="flex items-center justify-left gap-4">

        <div style={{ width: "400px" }}>
          <Input
            type="search"
            placeholder="Pesquisar por produtos..."
            className="flex-1 w-full"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {getCategoryName(selectedCategory)}
                <div><MdKeyboardArrowDown className="h-5 w-5 ml-2" /></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                <DropdownMenuRadioItem value="all">{t('Todas Categorias')}</DropdownMenuRadioItem>
                {Array.isArray(category) && category.map((categoria, index) => {

                  return (
                    <DropdownMenuRadioItem className="flex justify-between" key={index} value={categoria.name}>
                      <div>{t(categoria.name)}</div>
                      <div onClick={() => deleteCategory(categoria.id)} className="cursor-pointer">
                        <TrashIcon className="text-red-400 h-4 w-4" />
                      </div>
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {getSubCategoryName(selectedSubCategory)}
                <div><MdKeyboardArrowDown className="h-5 w-5 ml-2" /></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                <DropdownMenuRadioItem value="all">{t('Todas as SubCategorias')}</DropdownMenuRadioItem>
                {Array.isArray(subCategory) && subCategory.map((subCategoria, index) => {
                  //  console.log(subCategory)
                  return (
                    <DropdownMenuRadioItem className="flex justify-between" key={index} value={subCategoria.name}>
                      <div>{t(subCategoria.name)}</div>
                      <div onClick={() => deleteSubCategory(subCategoria.id)} className="cursor-pointer">
                        <TrashIcon className="text-red-400 h-4 w-4" />
                      </div>
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={() => setIsSheetOpen(true)}
              className="bg-red-400 hover:bg-red-500 dark:bg-red-400 dark:text-white dark:hover:bg-white hover:border hover:border-red-400 dark:hover:text-red-400">
              {t('Adicionar Produto')}
              <LuPackagePlus className="h-5 w-5 ml-2" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="min-w-[450px] bg-white p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <SheetHeader>
                <SheetTitle>{t('Adicionar novo Produto')}</SheetTitle>
                <SheetDescription>{t('Preencha os campos para adicionar um novo produto')}</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">{t('Código do produto')}</Label>
                    <Input id="code" type="text" {...register('code')} />
                    {errors.code && <span className="text-red-500 text-[12px]">{errors.code.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('Nome do produto')}</Label>
                    <Input id="name" type="text" {...register('name', { required: 'O nome do produto é obrigatório' })} />
                    {errors.name && <span className="text-red-500 text-[12px]">{errors.name.message}</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-[200px] max-w-[200px]">
                    <div className="pb-2">
                      <Label htmlFor="category">{t('Selecione uma categoria')}</Label>
                    </div>
                    <Select

                      defaultValue="all"
                      onValueChange={(value) => {
                        setFormCategoriaId(value);
                      }}>
                      <SelectTrigger >
                        <SelectValue placeholder="Selecione uma categoria" className="dark:text-red-400" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(category) && category.map((categoria, index) => (
                          <SelectItem key={index} value={categoria.id}>
                            {t(categoria.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-[200px] max-w-[180px]">
                    <div className="pb-2">
                      <Label htmlFor="subcategory">{t('Selecione uma subcategoria')}</Label>
                    </div>
                    <SelectTest
                      onMenuOpen={fetchSubCategoriesInCategories}
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      placeholder={"SubCategorias"}
                      options={subCategoryOnCategory?.map(subCat => ({ label: subCat.subcategory?.name, value: subCat?.id }))}
                      styles={customStyles}
                      onChange={handleValueChange}
                      isLoading={isLoading}
                      loadingMessage={() => null}
                      noOptionsMessage={() => "No Options"
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('Descrição')}</Label>
                  <Textarea maxLength={1000} id="description" className="max-h-[120px]" rows={3} {...register('description')} />
                  {errors.description && <span className="text-red-500 text-[12px]">{errors.description.message}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockQuant">{t('Quantidade em Estoque')}</Label>
                    <Input id="stockQuant" type="number" {...register('stockQuant', { required: 'A quantidade em estoque é obrigatória' })} />
                    {errors.stockQuant && <span className="text-red-500 text-[12px]">{errors.stockQuant.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitOfMeasure">{t('Unidade de Medida')}</Label>
                    <Input id="unitOfMeasure" type="text" {...register('unitOfMeasure')} />
                    {errors.unitOfMeasure && <span className="text-red-500 text-[12px]">{errors.unitOfMeasure.message}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">{t('Preço de compra')}</Label>
                    <Input id="purchasePrice" type="text" {...register('purchasePrice')} />
                    {errors.purchasePrice && <span className="text-red-500 text-[12px]">{errors.purchasePrice.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">{t('Preço de venda')}</Label>
                    <Input id="salePrice" type="text" {...register('salePrice', { required: 'O Preço de venda do produto é obrigatório' })} />
                    {errors.salePrice && <span className="text-red-500 text-[12px]">{errors.salePrice.message}</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">{t('Fornecedor')}</Label>
                    <Input id="supplier" type="text" {...register('supplier')} />
                    {errors.supplier && <span className="text-red-500 text-[12px]">{errors.supplier.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">{t('Imagem')}</Label>
                    <Input id="imageUrl" type="text" {...register('imageUrl')} />
                    {errors.imageUrl && <span className="text-red-500 text-[12px]">{errors.imageUrl.message}</span>}
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" className="bg-red-400 text-white hover:bg-white hover:text-red-400 border hover:border-red-400 dark:bg-red-400 dark:text-white dark:hover:bg-red-500 dark:hover:text-white">{t('Adicionar Produto')}</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        <Popover>
          <PopoverTrigger> <Button
            title="Adicionar Categoria"
            className="bg-red-400 hover:bg-red-500 dark:bg-red-400 dark:text-white dark:hover:bg-white hover:border hover:border-red-400 dark:hover:text-red-400">
            {t('Criar uma categoria')} <LuClipboardSignature className="ml-2 h-5 w-5" />
          </Button></PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-2"  >
              <div>
                <h1 className="pb-1">{t('Insira uma Categoria:')}</h1>
                <Input
                  className="max-w-[200px]"
                  placeholder="Ex: Bebidas"
                  id="category"
                  type="text"
                  onChange={(e) => setInputCategoria(e.target.value)} />
              </div>
              <div>
                <Button onClick={(onAddCategory)} className="bg-red-400 dark:bg-red-400" variant={"outline"}>{t('Criar')}</Button>
              </div>
            </div></PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger><CiMenuKebab className="h-6 w-6 text-black dark:text-white" /> </PopoverTrigger>
          <PopoverContent className="flex flex-col justify-center gap-2 w-[200px]">

            <Dialog>
              <DialogTrigger
                title="Criar uma SubCategoria"
                className="flex justify-center items-center min-w-[100px] min-h-[35px] max-h-[70px] rounded-md text-[13px]">
                <Button className="bg-red-400 dark:bg-red-400 text-[12px]" variant={"outline"}>{t('Criar uma SubCategoria')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[300px] p-5">
                <DialogHeader>
                  <DialogTitle>{t('Deseja Criar uma SubCategoria?')}</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-col gap-2" >

                      <div>
                        <h1 className="pb-1">{t('Insira uma SubCategoria:')}</h1>
                        <Input
                          className="max-w-[200px]"
                          placeholder="Ex: Refrigerantes"
                          id="category"
                          type="text"
                          onChange={(e) => setInputSubCategoria(e.target.value)} />
                      </div>
                      <div>
                        <Button onClick={(onAddSubCategory)} className="bg-red-400 dark:bg-red-400" variant={"outline"}>{t('Criar')}</Button>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger
                className=" flex flex-row gap-2 justify-center items-center min-h-[40px] rounded-md">
                <Button className="bg-red-400 dark:bg-red-400 text-[12px] " variant={"outline"}>{t('Adicionar uma Categoria ')} <br />{t('em uma SubCategoria')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>{t('Deseja Atribuir uma Categoria a uma SubCategoria?')}</DialogTitle>
                  <DialogDescription>
                    <h1 className="pb-1">{t('Escolha uma Categoria e uma SubCategoria')}</h1>
                    <div className=" gap-2" >
                      <div className="flex flex-row items-center gap-4 pb-2 pt-2">

                        <div>

                          <Select onValueChange={(value) => setChooseCategory(value)} defaultValue="all">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{t('Todas Categorias')}</SelectItem>
                              {Array.isArray(category) && category.map((categoria, index) => (
                                <SelectItem key={index} value={categoria.id}>
                                  {t(categoria.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <TbArrowMoveRight className="h-6 w-6" />
                        <div>
                          <Select onValueChange={(value) => setChooseSubCategory(value)} defaultValue="all">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma Subcategoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{t('Todas SubCategorias')}</SelectItem>
                              {Array.isArray(subCategory) && subCategory.map((subcategoria, index) => (
                                <SelectItem key={index} value={subcategoria.id}>
                                  {t(subcategoria.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button
                          onClick={(onAddCategoryOnSubCategory)}
                          className="bg-red-400 dark:bg-red-400 dark:text-white" variant={"outline"}>{t('Adicionar')}</Button>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

          </PopoverContent>
        </Popover>

      </div>
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { column: "productCode", label: 'Código do produto' },
                { column: "productName", label: 'Nome do produto' },
                { column: "category", label: 'Categoria' },
                { column: "subCategory", label: 'SubCategoria' },
                { column: "description", label: 'Descrição' },
                { column: "stockQuantity", label: 'Quantidade em Estoque' },
                { column: "unitOfMeasure", label: 'Unidade de medida' },
                { column: "purchasePrice", label: 'Preço de compra' },
                { column: "salePrice", label: 'Preço de venda' },
                { column: "supplier", label: 'Fornecedor' },
                { column: "actions", label: 'Ações' }
              ].map(({ column, label }) => (
                <TableHead className="cursor-pointer" onClick={() => handleSort(column)} key={column}>
                  {t(label)}{" "}
                  {sortColumn === column && (
                    <span className="ml-1">{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14}>
                  <p className="text-center">
                    {t('Não há produtos disponíveis.')}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInventory.map((item) => {
                // console.log('item:', item);

                return (
                  <TableRow key={item.code}>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      {item.Category_Product[0]?.category.name}
                    </TableCell>
                    <TableCell>
                      {item.Category_Product.map((categoryProduct) =>
                        categoryProduct.Category_SubCategory_Product.map((subCategoryProduct, index, array) => (
                          <div key={subCategoryProduct.id}>
                            {subCategoryProduct.category_subcategory.subcategory.name}
                            {index < array.length - 1 && ','}
                          </div>
                        ))
                      )}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.stockQuant}
                    </TableCell>
                    <TableCell>{item.unitOfMeasure}</TableCell>
                    <TableCell>{t('R$')} {String(item.purchasePrice)}</TableCell>
                    <TableCell>{t('R$')} {String(item.salePrice)}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger><CiMenuKebab className="h-5 w-5 dark:text-white" /></PopoverTrigger>
                        <PopoverContent className="flex flex-col gap-2 max-w-[200px]">
                          <Button
                            className="bg-red-400 dark:bg-red-400 dark:hover:bg-red-500 text-white hover:border-red-400 hover:text-red-400"
                            variant={"outline"}
                            onClick={() => handleDelete(item.id)}
                          >
                            {t('Excluir')} <TrashIcon className="h-5 w-5 ml-1" />
                          </Button>

                          <Sheet open={isSheetUpdateOpen} onOpenChange={setIsSheetUpdateOpen}>
                            <SheetTrigger asChild>
                              <Button
                                onClick={async () => {
                                  await handleUpdateClick(item); // Certifique-se de que selectedProduct está definido aqui  
                                  setIsSheetUpdateOpen(true);
                                }}
                                className="bg-red-400 dark:bg-red-400 dark:hover:bg-red-500 text-white hover:border-red-400 hover:text-red-400"
                                variant={"outline"}>
                                {t('Atualizar')} <GrUpdate className="h-4 w-4 ml-1" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="min-w-[450px] bg-white p-4">
                              <form onSubmit={handleSubmit(onUpdate)}>
                                <SheetHeader>
                                  <SheetTitle>{t('Atualizar um Produto')}</SheetTitle>
                                  <SheetDescription>{t('Preencha os campos para atualizar um novo produto')}</SheetDescription>
                                </SheetHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="code">{t('Código do produto')}</Label>
                                      <Input
                                        id="code"
                                        type="text"
                                        {...register('code')}
                                        defaultValue={selectedProduct?.code || ''}
                                      />
                                      {errors.code && <span className="text-red-500 text-[12px]">{errors.code.message}</span>}

                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="name">{t('Nome do produto')}</Label>
                                      <Input
                                        id="name"
                                        type="text"
                                        {...register('name', { required: 'O nome do produto é obrigatório' })}
                                        defaultValue={selectedProduct?.name || ''} />
                                      {errors.name && <span className="text-red-500 text-[12px]">{errors.name.message}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-[200px] max-w-[200px]">
                                      <div className="pb-2">
                                        <Label htmlFor="category">{t('Categoria atual')}</Label>
                                      </div>

                                      <SelectTest
                                        closeMenuOnSelect={true}
                                        options={categoryOptions}
                                        components={animatedComponents}
                                        placeholder={"Categorias"}
                                        styles={customStyles}
                                        defaultValue={selectedCategoryOptions}
                                        onChange={(selectedOption) => {
                                          if (selectedOption && 'value' in selectedOption) {
                                            setFormCategoriaId(selectedOption.value);
                                            setSelectedSubcategoryOptions([]);
                                            setSelectedOptions([])
                                          } else {
                                            setFormCategoriaId('');
                                            setSelectedSubcategoryOptions([]);
                                          }
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-[200px] max-w-[180px]">
                                      <div className="pb-2">
                                        <Label htmlFor="subcategory">{t('Selecione uma subcategoria')}</Label>
                                      </div>
                                      <SelectTest
                                        key={selectedSubcategoryOptions.length > 0 ? 'loaded' : 'loading'}
                                        onMenuOpen={fetchSubCategoriesInCategories}
                                        closeMenuOnSelect={false}
                                        components={animatedComponents}
                                        isMulti
                                        placeholder={"SubCategorias"}
                                        defaultValue={selectedSubcategoryOptions}
                                        options={subCategoryOnCategory?.map(subCat => ({ label: subCat.subcategory?.name, value: subCat?.id }))}
                                        styles={customStyles}
                                        onChange={handleValueChange}
                                        isLoading={isLoading}
                                        loadingMessage={() => null}
                                        noOptionsMessage={() => "No Options"
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="description">{t('Descrição')}</Label>
                                    <Textarea maxLength={1000}
                                      id="description"
                                      className="max-h-[120px]"
                                      rows={3}
                                      {...register('description')}
                                      defaultValue={selectedProduct?.description || ''}
                                    />
                                    {errors.description && <span className="text-red-500 text-[12px]">{errors.description.message}</span>}
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="stockQuant">{t('Quantidade em Estoque')}</Label>
                                      <Input
                                        id="stockQuant"
                                        type="number"
                                        {...register('stockQuant', { required: 'A quantidade em estoque é obrigatória' })}
                                        defaultValue={selectedProduct?.stockQuant || ''} />
                                      {errors.stockQuant && <span className="text-red-500 text-[12px]">{errors.stockQuant.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="unitOfMeasure">{t('Unidade de Medida')}</Label>
                                      <Input
                                        id="unitOfMeasure"
                                        type="text" {...register('unitOfMeasure')}
                                        defaultValue={selectedProduct?.unitOfMeasure || ''} />
                                        {errors.unitOfMeasure && <span className="text-red-500 text-[12px]">{errors.unitOfMeasure.message}</span>}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="purchasePrice">{t('Preço de compra')}</Label>
                                      <Input
                                        id="purchasePrice"
                                        type="text"
                                        {...register('purchasePrice')}
                                        defaultValue={selectedProduct?.purchasePrice || ''} />
                                        {errors.purchasePrice && <span className="text-red-500 text-[12px]">{errors.purchasePrice.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="salePrice">{t('Preço de venda')}</Label>
                                      <Input
                                        id="salePrice"
                                        type="text"
                                        {...register('salePrice', { required: 'O Preço de venda do produto é obrigatório' })}
                                        defaultValue={selectedProduct?.salePrice || ''} />
                                      {errors.salePrice && <span className="text-red-500 text-[12px]">{errors.salePrice.message}</span>}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="supplier">{t('Fornecedor')}</Label>
                                      <Input
                                        id="supplier"
                                        type="text" {...register('supplier')}
                                        defaultValue={selectedProduct?.supplier || ''} />
                                        {errors.supplier && <span className="text-red-500 text-[12px]">{errors.supplier.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="imageUrl">{t('Imagem')}</Label>
                                      <Input
                                        id="imageUrl"
                                        type="text" {...register('imageUrl')}
                                        defaultValue={selectedProduct?.imageUrl || ''} />
                                        {errors.imageUrl && <span className="text-red-500 text-[12px]">{errors.imageUrl.message}</span>}
                                    </div>
                                  </div>
                                </div>
                                <SheetFooter>
                                  <Button
                                    type="submit"
                                    className="bg-red-400 text-white hover:bg-white hover:text-red-400 border hover:border-red-400 dark:bg-red-400 dark:text-white dark:hover:bg-red-500 dark:hover:text-white">{t('Atualizar Produto')}</Button>
                                </SheetFooter>
                              </form>
                            </SheetContent>
                          </Sheet>

                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <Pagination className="pt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={prevPage}>{t('Anterior')}</PaginationPrevious>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink href="#" onClick={() => setPage(index + 1)} isActive={currentPage === index + 1}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>

            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={nextPage}>{t('Próximo')}</PaginationNext>
            </PaginationItem>

          </PaginationContent>
        </Pagination>

      </div>
    </div>
  )
}