import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs/promises';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

// Prisma client initialization
const prisma = new PrismaClient();

// S3 client initialization
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Configuration to allow file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Validation schema
const driverSchema = yup.object().shape({
  fullName: yup.string().required('Nome completo é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  address: yup.string().required('Endereço é obrigatório'),
  city: yup.string().required('Cidade é obrigatória'),
  state: yup.string().required('Estado é obrigatório'),
  vehicleModel: yup.string().required('Modelo do veículo é obrigatório'),
  licensePlate: yup.string().required('Placa do veículo é obrigatória'),
  vehicleType: yup.string().required('Tipo de veículo é obrigatório'),
  startTime: yup.string().required('Horário de início é obrigatório'),
  endTime: yup.string().required('Horário de término é obrigatório'),
  availableDays: yup.array().of(yup.string()).required('Dias disponíveis são obrigatórios'),
});

// Function to upload file to S3
const uploadToS3 = async (file: formidable.File): Promise<string> => {
  console.log('Uploading file:', file.originalFilename);
  const fileExtension = file.originalFilename?.split('.').pop() || '';
  const fileName = `${uuidv4()}.${fileExtension}`;
  const fileContent = await fs.readFile(file.filepath);



  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: file.mimetype || 'application/octet-stream'
  }; 


  try {    
    const command = new PutObjectCommand(params);
    await s3.send(command);       
    
    const uploadedFileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log('File uploaded, URL:', uploadedFileUrl);
    return uploadedFileUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
  } finally {
    // Clean up the temporary file
    await fs.unlink(file.filepath).catch(console.error);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // Check for required environment variables
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
    console.error('Missing required AWS environment variables');
    return res.status(500).json({ message: 'Configuração do servidor incompleta' });
  }

  if (req.method === 'POST') {
    const form = formidable({ multiples: true });

    try {
      const [fields, files] = await new Promise<[formidable.Fields<string>, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      console.log('Parsed fields:', fields);
      console.log('Parsed files:', files);

      // Process all fields
      const processedFields = Object.entries(fields).reduce((acc, [key, value]) => {
        if (value && value[0]) {
          if (key === 'availableDays') {
            acc[key] = value[0].split(',');
          } else {
            acc[key] = value[0];
          }
        }
        return acc;
      }, {} as Record<string, string | string[]>);

      console.log('Processed fields:', processedFields);

      // Validate fields
      await driverSchema.validate(processedFields);

      // Upload files
      const photoUrl = files.photo?.[0] ? await uploadToS3(files.photo[0]) : null;
      const idUrl = files.id?.[0] ? await uploadToS3(files.id[0]) : null;
      const proofOfResidenceUrl = files.proofOfResidence?.[0] ? await uploadToS3(files.proofOfResidence[0]) : null;
      const vehicleDocumentUrl = files.vehicleDocument?.[0] ? await uploadToS3(files.vehicleDocument[0]) : null;

      console.log('Uploaded file URLs:', { photoUrl, idUrl, proofOfResidenceUrl, vehicleDocumentUrl });

      // Insert information into the database
      const newDriver = await prisma.deliveryDriver.create({
        data: {
          fullName: processedFields.fullName as string,
          email: processedFields.email as string,
          phone: processedFields.phone as string,
          address: processedFields.address as string,
          city: processedFields.city as string,
          state: processedFields.state as string,
          vehicleModel: processedFields.vehicleModel as string,
          licensePlate: processedFields.licensePlate as string,
          vehicleType: processedFields.vehicleType as string,
          startTime: processedFields.startTime as string,
          endTime: processedFields.endTime as string,
          availableDays: (processedFields.availableDays as string[]).join(','),
          photoUrl: photoUrl ?? '',
          idUrl: idUrl ?? '',
          proofOfResidenceUrl: proofOfResidenceUrl ?? '',
          vehicleDocumentUrl: vehicleDocumentUrl ?? '',
        },
      });

      console.log('New driver created:', newDriver);

      res.status(200).json({ message: 'Motorista adicionado com sucesso', driver: newDriver });
    } catch (error) {
      console.error('Detailed error:', error);
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({ message: error.message, errors: error.errors });
      }
      console.error('Error processing the form:', error);
      res.status(500).json({ message: 'Erro ao processar o formulário' });
    }
  } else if (req.method === 'GET') {
    try {
      const drivers = await prisma.deliveryDriver.findMany();
      res.status(200).json({ drivers });
    } catch (error) {
      console.error('Error fetching drivers:', error);
      res.status(500).json({ message: 'Erro ao buscar motoristas' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}