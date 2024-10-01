


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CiDollar } from "react-icons/ci";
import { IoBagHandleSharp } from "react-icons/io5";
import { IoQrCode } from "react-icons/io5";
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from "next";
import { useState } from "react";
import nookies from 'nookies';
import { IoStorefrontOutline } from "react-icons/io5";

import { useSession } from 'next-auth/react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    // Busca cookies do contexto da requisição (ctx)
    const cookies = nookies.get(ctx);

    // Acessando um cookie específico
    const token = cookies['next-auth.session-token'];

    return {
        props: {
            token: token || null, // Passa o cookie para o componente
        },
    };
};


const DashBoardDisplay = ({ token }: { token: string | null }) => {
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const { data: session } = useSession();
    const { t } = useTranslation('common');

    const handleToggle = async (checked: boolean) => {
        setIsStoreOpen(checked);
        console.log('Todos os cookies:',);
        if (checked) {
            // Verifica se há uma sessão disponível
            if (session) {
                const accessToken = token; // Nome do cookie que armazena o accessToken
                console.log('token', accessToken)
                try {
                    const response = await fetch('https://fluxo.qu1ck.com.br/webhook/e5c9c628-317c-49ca-b46d-e92b63c7e27d', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // Adiciona o token da sessão aos cabeçalhos
                            'Authorization': `Bearer ${accessToken || ''}`,
                        },
                        body: JSON.stringify({
                            message: 'Abrir Loja',
                            token: accessToken
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao enviar a mensagem');
                    }

                    console.log('Sessão enviada com sucesso!');
                } catch (error) {
                    console.error('Erro ao enviar a mensagem:', error);
                }
            } else {
                console.log('Nenhuma sessão ativa.');
            }
        }
    };


    // Mock data for the chart
    const salesData = [
        { name: 'Mon', sales: 1000 },
        { name: 'Tue', sales: 1200 },
        { name: 'Wed', sales: 900 },
        { name: 'Thu', sales: 1500 },
        { name: 'Fri', sales: 2000 },
        { name: 'Sat', sales: 2200 },
        { name: 'Sun', sales: 1800 },
    ]

    // Mock data for order history
    const orderHistory = [
        { id: '001', date: '2023-06-01', total: 50.00, status: 'Completed' },
        { id: '002', date: '2023-06-02', total: 75.50, status: 'Processing' },
        { id: '003', date: '2023-06-03', total: 120.00, status: 'Completed' },
    ]

    return (
        <div className="p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Store Status Card */}

                <Card className="">
                    <CardHeader className="flex flex-row justify-between">
                        <CardTitle className="text-xl font-bold">{('Status da loja')}</CardTitle>
                        <div className="flex flex-col items-center gap-2">
                            <Switch className="data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-red-400" id="store-status" checked={isStoreOpen} onCheckedChange={handleToggle} />
                            <Label htmlFor="store-status">{isStoreOpen ? 'Aberta' : 'Fechada'}</Label>
                        </div>
                    </CardHeader>
                    <CardContent className="">
                        <div className="flex items-center space-x-4 ">
                            <div className="flex items-center gap-2">

                                <IoStorefrontOutline className={`h-7 w-7 min-h-5 min-w-5 custom-icon ${isStoreOpen ? 'text-green-500' : 'text-red-500'}`} />

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{t('A loja está')}{isStoreOpen ? ' aberta' : ' fechada'}</h3>
                                    <p className="text-sm text-gray-500">
                                        {isStoreOpen
                                            ? 'Clientes podem fazer pedidos'
                                            : 'Clientes não podem fazer pedidos'}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                {/* Daily Orders Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('Pedidos do dias')}</CardTitle>
                        <IoBagHandleSharp className="h-7 w-7 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                    </CardContent>
                </Card>

                {/* Total Sales Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('Total de Vendas')}</CardTitle>
                        <CiDollar className="h-7 w-7 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,234.56</div>
                        <p className="text-xs text-muted-foreground">
                            {t('10% mês passado')}
                        </p>
                    </CardContent>
                </Card>

                {/* WhatsApp QR Code Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('Whatsapp QR Code')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <IoQrCode className="h-20 w-20"/>
                    </CardContent>
                </Card>

            </div>

            {/* Sales Chart */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>{t('vendas semanais')}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#df7777" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Order History */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>{t('Histórico de Pedidos')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('')}</TableHead>
                                <TableHead>{t('')}</TableHead>
                                <TableHead>{t('')}</TableHead>
                                <TableHead>{t('')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderHistory.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>${order.total.toFixed(2)}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
export default DashBoardDisplay;