import { useState, useRef } from 'react';
import { InputWithLabel } from '@/components/shared';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';
import TogglePasswordVisibility from '../shared/TogglePasswordVisibility';
import AgreeMessage from './AgreeMessage';
import ReCAPTCHA from 'react-google-recaptcha';
import { maxLengthPolicies } from '@/lib/common';
import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface JoinProps {
  recaptchaSiteKey: string | null;
}

const JoinUserSchema = Yup.object().shape({
  name: Yup.string().required('Por favor preencha este campo').max(maxLengthPolicies.name),
  email: Yup.string().required('Por favor preencha este campo').email().max(maxLengthPolicies.email),
  password: Yup.string()
    .required('Por favor preencha este campo')
    .min(passwordPolicies.minLength)
    .max(maxLengthPolicies.password),
  team: Yup.string().required('Por favor preencha este campo').min(3).max(maxLengthPolicies.team),
  telephone: Yup.string().required('Por favor preencha este campo'),
  idNumber: Yup.string().required('Por favor preencha este campo').min(11, 'O CPF deve ter no mínimo 11 caracteres').max(11, 'O CPF deve ter no máximo 11 caracteres'),
  address: Yup.string().required('Por favor preencha este campo'),
  category: Yup.string().required('Por favor preencha este campo'),
  cep: Yup.string()
    .required('O CEP é obrigatório')
    .matches(/^\d{8}$/, 'Formato inválido de CEP'),
  orderQuantity: Yup.string().required('Por favor preencha este campo'),
  storeQuantity: Yup.string().required('Por favor preencha este campo'),

});



const Join = ({ recaptchaSiteKey }: JoinProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [selectedType, setSelectedType] = useState('Pessoa Física');

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

 

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      team: '',
      category: 'Pessoa Física',
      idNumber: '',
      cep: '',
      address: '',
      telephone: '',
      storeQuantity: '',
      orderQuantity: '',
    },
    validationSchema: JoinUserSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log('Submitting values:', values);
      const response = await fetch('/api/auth/join', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          ...values,
          recaptchaToken,
        }),
      });


      const json = (await response.json()) as ApiResponse<{
        confirmEmail: boolean;
      }>;

      recaptchaRef.current?.reset();

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();

      if (json.data.confirmEmail) {
        router.push('/auth/verify-email');
      } else {
        toast.success(t('successfully-joined'));
        router.push('/auth/login');
      }
    },
  });


 
  const handleCEPChange = async (e: any) => {
    formik.handleChange(e);

    const cep = e.target.value;
    const cepFormatado = cep.replace(/\D/g, '');

    formik.setFieldValue('cep', cepFormatado);

    if (cepFormatado.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepFormatado}/json/`);
        if (!response.data.erro) {
          formik.setValues({
            ...formik.values,
            cep: cepFormatado,
            address: response.data.logradouro || '',

          });
        } else {
          toast.error('CEP não encontrado');
          formik.setFieldValue('cep', undefined);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do CEP:', error);
        toast.error('Erro ao buscar dados do CEP');
      }
    } else {
      formik.setValues({
        ...formik.values,
        cep: cepFormatado,
        address: '',
      })
    }
  };

  const validatorCPF = async (e) => {
    formik.handleChange(e);
  
    const cpf = e.target.value;
    const cpfFormatado = cpf.replace(/[.-]/g, '');
  
    formik.setFieldValue('idNumber', cpfFormatado);
  
   
    if (cpfFormatado.length === 11) {
      try {
        const response = await axios.post(`/api/cpf-validation`, {
          cpf: cpfFormatado
        });
  
        if (response.status === 200 && !response.data.erro) {
          formik.setValues({
            ...formik.values,
            idNumber: cpfFormatado,
          });
          toast.success('CPF encontrado');
        } else {
          toast.error('CPF não encontrado');
          formik.setFieldValue('idNumber', '');
        }
      } catch (error) {
        console.error('Erro ao buscar o CPF:', error);
        toast.error('Erro ao buscar o CPF');
      }
    } 
  };


  const validatorCNPJ = async (e) => {
    formik.handleChange(e);

    const cnpj = e.target.value;
    const cnpjFormatado = cnpj.replace(/[./-]/g, '');

    formik.setFieldValue('idNumber', cnpjFormatado);

    if (cnpjFormatado.length === 14) {
      try {
        const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjFormatado}`);
        if (response.status === 200) {
          const data = response.data;
          formik.setValues({
            ...formik.values,
            idNumber: cnpjFormatado,
            cep: data.cep ? data.cep.replace(/\D/g, '') : '',
            address: data.logradouro || '',
          });
          toast.success('CNPJ encontrado');
        } else {
          toast.error('CNPJ não encontrado');
          formik.setFieldValue('idNumber', undefined);
        }
      } catch (error) {
        console.error('Erro ao buscar o CNPJ:', error);
        toast.error('Erro ao buscar o CNPJ');
      }
    } 
  };




  const handleTypeChange = (type) => {
    setSelectedType(type);
    formik.setFieldValue('category', type);
    formik.resetForm({ values: { ...formik.initialValues, category: type } });
  };





  return (
    <form onSubmit={formik.handleSubmit}>
      <div className='flex justify-center items-center gap-20 h-20 pb-3'>
        <button
          type='button'
          className={`btn btn-outline w-30 h-20 border-gray-200 hover:text-white hover:bg-red-500 hover:border-gray-300 ${selectedType === 'Pessoa Física' ? 'bg-red-500 text-white' : ''}`}
          onClick={() => handleTypeChange('Pessoa Física')}
        >
          <div className='grid grid justify-items-center items-center ' >
            <UserIcon className='w-7 ' />

            {t('Pessoa Física')}
          </div>
        </button>
        <button
          type='button'
          className={`btn btn-outline w-30 h-20 border-gray-200 hover:text-white hover:bg-red-500 hover:border-gray-300 ${selectedType === 'Pessoa Jurídica' ? 'bg-red-500 text-white' : ''}`}
          onClick={() => handleTypeChange('Pessoa Jurídica')}
          value={formik.values.category}
          onChange={formik.handleChange}>
          <div className='grid grid justify-items-center items-center '>
            <BuildingOfficeIcon className='w-7  ' />
            {t('Pessoa Jurídica')}
          </div>
        </button>
      </div>

      <div className='grid grid-cols-2 gap-5'>
        <InputWithLabel
          type="text"
          label={t('Nome Completo')}
          name="name"
          placeholder={t(' Digite seu nome completo')}
          value={formik.values.name}
          error={formik.touched.name ? formik.errors.name : undefined}
          onChange={formik.handleChange}
        />
        <InputWithLabel
          type="text"
          label={t('Telefone')}
          name="telephone"
          placeholder={t('Ex: (00)0000-0000')}
          value={formik.values.telephone}
          error={formik.errors.telephone}
          onChange={formik.handleChange}
        />
      </div>

      <div className='grid grid-cols-2 gap-5'>
        <InputWithLabel
          type="text"
          label={t('Número de Identificação:')}
          name="idNumber"
          placeholder={selectedType === 'Pessoa Física' ? t('Digite o seu CPF') : t('Digite o seu CNPJ')}
          value={formik.values.idNumber}
          error={formik.errors.idNumber}
          onChange={selectedType === 'Pessoa Física' ? validatorCPF : validatorCNPJ}
        />


        <InputWithLabel
          type="text"
          label={t('Loja')}
          name="team"
          placeholder={t('Nome da Loja')}
          value={formik.values.team}
          error={formik.errors.team}
          onChange={formik.handleChange}
        />
      </div>
      <div className='grid grid-cols-2 gap-5'>

        <InputWithLabel
          readOnly={selectedType === 'Pessoa Jurídica'}
          type="text"
          label={t('Cep')}
          name="cep"
          placeholder={t('Digite o seu Cep')}
          value={formik.values.cep}
          error={formik.errors.cep}
          onChange={handleCEPChange}
          className={`${selectedType === 'Pessoa Jurídica' ? 'cursor-not-allowed' : ''}`}
        />
        <InputWithLabel
          type="text"
          readOnly
          className='cursor-not-allowed'
          label={t('Endereço')}
          name="address"
          placeholder={t('Digite o seu endereço')}
          value={formik.values.address}
          error={formik.errors.address}
          onChange={formik.handleChange}
        />


      </div>





      <div className="grid grid-cols-2 gap-5 pb-1">
        <InputWithLabel
          type="email"
          label={t('email')}
          name="email"
          placeholder={t('exemplo@qu1ck.com')}
          value={formik.values.email}
          error={formik.errors.email}
          onChange={formik.handleChange}
        />
        <div className='relative flex'>
          <InputWithLabel
            type={isPasswordVisible ? 'text' : 'password'}
            label={t('Senha')}
            name="password"
            placeholder={t('Senha')}
            value={formik.values.password}
            error={formik.errors.password}
            onChange={formik.handleChange}
          />
          <TogglePasswordVisibility
            isPasswordVisible={isPasswordVisible}
            handlePasswordVisibility={handlePasswordVisibility}
          />
        </div>


      </div>

      <div className='grid grid-cols-2 gap-5 pt-1'>
        <div>
          <select className="select select-bordered w-full max-w-xs "
            value={formik.values.storeQuantity}
            onChange={formik.handleChange}
            name="storeQuantity"
          >
            <option value={''} disabled selected>{t('Possui quantas lojas?')}</option>
            <option value={'uma loja'}>{t('Uma loja')}</option>
            <option value={'mais de uma'}>{t('Mais de uma loja')}</option>
            <option value={'mais de cinco'}>{t('Mais de cinco lojas')}</option>
          </select>
          {formik.errors.storeQuantity && formik.touched.storeQuantity && (
            <p className="text-red-500 text-xs pt-1">{formik.errors.storeQuantity}</p>
          )}
        </div>

        <div>
          <select className="select select-bordered w-full max-w-xs "
            value={formik.values.orderQuantity}
            onChange={formik.handleChange}
            name="orderQuantity"
          >
            <option value={''} disabled selected>{t('Média de pedidos diários:')}</option>
            <option value={'≈50'}>{t('≈50')}</option>
            <option value={'≈100'}>{t('≈100')}</option>
            <option value={'≈200'}>{t('≈200')}</option>
            <option value={'acima de 200'}>{t('acima de 200')}</option>
          </select>
          {formik.errors.orderQuantity && formik.touched.orderQuantity && (
            <p className="text-red-500 text-xs pt-1">{formik.errors.orderQuantity}</p>
          )}
        </div>
      </div>
      <GoogleReCAPTCHA
          recaptchaRef={recaptchaRef}
          onChange={setRecaptchaToken}
          siteKey={recaptchaSiteKey}
        />
      <div>
        <div className='w-60 flex mx-auto pt-5 pb-2'>
          <Button
            type="submit"
            color="error"
            loading={formik.isSubmitting}
            active={formik.dirty}
            fullWidth
            className='w-lg text-white bg-red-500 hover:bg-red-600'
            size="md"

          >
            {t('Criar Conta')}
          </Button>
        </div>
        <AgreeMessage text={t('create-account')}/>
      </div>
    </form>
  );
};

export default Join;
