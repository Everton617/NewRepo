import { ApiError } from "@/lib/errors";
import { updateTeam } from "./team";
import { slugify } from "@/lib/server-common";
import env from "@/lib/env";

const evoHeaders = {apiKey: `${env.evolution.apiKey}`, "Content-Type": "application/json"}; 

export async function createEvoInstance(teamName: string) {
    const response = await fetch(`${env.evolution.sourceUrl}/instance/create`, {
        headers: evoHeaders,
        method: "POST",
        body: JSON.stringify({
            instanceName: slugify(teamName),
            webhook: `${env.evolution.webhookUrl}`,
            webhook_by_events: true,
            events: ["SEND_MESSAGE"]
        })
    });

    if (!response.ok && response.status === 403) console.warn(`${response.status} > instance name already in use ..`);
    if (!response.ok) console.warn(response.status, "error creating instance ..");

    const data = await response.json();
    const newTeam = await updateTeam(slugify(teamName),{
        evo_instance_key: data.hash.apikey,
        evo_instance_id: data.instance.instanceId,
        evo_instance_name: data.instance.instanceName
    });
    
    return {
        team: {...newTeam},
        team_evo_instance: {...data}
    }
}

export async function deleteEvoInstance(instanceName: string) {
    const response = await fetch(`${env.evolution.sourceUrl}/instance/delete/${instanceName}`, {
        headers: evoHeaders,
        method: "DELETE",
    });

    if (!response.ok) throw new ApiError(response.status, "error deleting instance ..");
    const data = await response.json();

    return data;
}

export async function getInstanceStatus(instanceName: string, instanceKey: string) {
    const response = await fetch(
        `${env.evolution.sourceUrl}/instance/connectionState/${instanceName}`,
        { 
            method: "GET",
            headers: {apiKey: instanceKey}
        }
    );

    const data = await response.json();
    return data;
}

export async function requestEvoInstanceConnection(instanceName: string) {
    const response = await fetch(`${env.evolution.sourceUrl}/instance/connect/${instanceName}`, {
        headers: evoHeaders
    })
    const data = await response.json();
    console.log(data);
    if (data.status === 404 && data.error === "Not Found") {
        await createEvoInstance(instanceName)
        return await requestEvoInstanceConnection(instanceName);
    };
    return data.code; 
}

export async function disconnectFromEvoInstance(instanceName: string) {
    const response = await fetch(`${env.evolution.sourceUrl}/instance/logout/${instanceName}`, {
        headers: evoHeaders,
        method: "DELETE"
    });

    const data = await response.json();
    return data;
}


export async function getAllEvoContacts(instanceName: string, instanceKey: string) {
    const response = await fetch(`${env.evolution.sourceUrl}/chat/findContacts/${instanceName}`, {
        method: "POST",
        headers: {
            apiKey: instanceKey,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data;
}

export async function getEvoInstance(instanceName: string) {
    const headers = {
        apiKey: env.evolution.apiKey as string,
        'Content-Type': 'application/json'
    }

    const response = await fetch(
        `${env.evolution.sourceUrl}/instance/fetchInstances?instanceName=${instanceName}`, 
        {headers: headers}
    );
    const data = await response.json();

    if (data.status === 404)  {
        console.log("[LOG] > Instance Not found. Creating one ...");
        await createEvoInstance(instanceName);

        console.log("[LOG] > Instance created. Returning it ...");
        return await getEvoInstance(instanceName);
    }

    return data.instance;
}
