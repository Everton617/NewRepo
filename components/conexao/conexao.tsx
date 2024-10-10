import { Table } from '@/components/shared/table/Table';
import useTeam from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import { Error, Loading } from '@/components/shared';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

function getInstanceNumber(text?: string) {
    if (!text) return "?";
    let buffer: string = "";
    for (const char of text) {
        if (char === "@") break; 
        buffer += char;
    }
    console.log(buffer);
    return buffer;
}

export default function Conexao() {
    const { t } = useTranslation('common');
    const { team } = useTeam();
    const [isQrcodeVisible, setQrcodeVisible] = useState(false);
    const [instanceStatus, setInstanceStatus] = useState('desconectado');
    const [isLoading, setIsloading] = useState(true);
    const [instance, setInstance] = useState({owner: "?"});
    const [qrCode, setQrCode] = useState("");


    useEffect(() => {
        if (!team) return;
        fetch(
            `/api/teams/${team.slug}/evo-instance/`,
            {method: "GET"}
        )
        .then(response => response.json())
        .then(data => {
            const instance = data.instance;
            console.log(instance.status);
            console.log("from front => ", instance);
            setInstance(instance);
            setInstanceStatus(instance.status === 'open' ? 'conectado' : 'desconectado')
            setIsloading(false);
        })
        .catch(error => console.log("[FETCH ERROR] > ", error));
    }, []);
          
    if (!team) return <Error message={t('team-not-found')} />;

    return (
        <>
            {isLoading ? 
                <Loading /> :
                <Table
                  cols={[t('name'), t('status'), t('phone'), t('actions')]}
                  body={[{id: "", name: `${team.slug}`}].map((apiKey) => {
                    return {
                      id: apiKey.id,
                      cells: [
                        { wrap: true, text: apiKey.name },
                        {
                          badge: {
                            color: `${instanceStatus === 'conectado' ? 'success' : 'error'}`,
                            text: t(`${instanceStatus}`),
                          },
                        },
                        {
                          wrap: true,
                          text: `${instanceStatus === 'conectado' ? getInstanceNumber(instance.owner) : '--'}`,
                        },
                        {
                          buttons: [
                            (instanceStatus === 'conectado' ? 
                                 {
                                  color: 'error',
                                  text: t('disconnect'),
                                  onClick: async () => {
                                      const response = await fetch(
                                        `/api/teams/${team.slug}/evo-instance/connection`,
                                        {
                                            method: "DELETE"
                                        });

                                      if (response.ok) {
                                        setInstance({owner: "?"});
                                        setInstanceStatus('desconectada')
                                      };
                                      const data = await response.json();
                                      console.log(data);
                                  },
                                }                                
                                : // SEPARATOR
                                {
                                  color: 'normal',
                                  text: t('connect'),
                                  onClick: async () => {
                                      const response = await fetch(
                                        `/api/teams/${team.slug}/evo-instance/connection`,
                                        {
                                            method: "POST"
                                        });
                                        
                                      if (response.ok) {
                                        setQrcodeVisible(true);
                                      }
                                      const data = await response.json();
                                      console.log(data.QRcode);
                                  },
                                }
                            )
                          ],
                        },
                      ],
                    };
                  })}
                ></Table>
            }
            {isQrcodeVisible ? 
                <div className="w-[300px] h-[400px] flex flex-col items-center gap-5 p-3 px-5 text-white rounded-md border">
                  <QRCode value={qrCode}/>
                  <div className="w-full flex flex-col gap-3 text-black">
                    <button 
                        className="bg-white w-full p-2 rounded-lg border border-black/40"
                        onClick={async () => {
                            const response = await fetch(
                                `/api/teams/${team.slug}/evo-instance/connection`,
                                {
                                    method: "POST"
                                });
                                
                            if (response.ok) {
                                const data = await response.json();
                                console.log(data.QRcode);
                                setQrCode(data.QRcode);
                                setQrcodeVisible(true);
                            }
                        }}
                    >{t("regenerate")}</button>
                    <button 
                        className="bg-white w-full p-2 rounded-lg border border-black/40"
                        onClick={() => {
                            setQrcodeVisible(false);
                        }}
                    >{t('close')}</button>
                  </div>
                </div>
                : <></>} 
        </>
    );
}
