import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {decrypt} from "@/lib/encryption";

export interface LLMProviderModel {
    id: string
    name: string
}

export interface LLMProviderModelListResponse {
    llmProviderModels: LLMProviderModel[]
}

export async function GET(
    req: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params
    const llmProvider = await prisma.lLMProvider.findUniqueOrThrow({
        where: {id}
    });
    let apiKey: string
    try {
        apiKey = decrypt(llmProvider.apiKey)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        apiKey = ''
    }

    if (llmProvider.providerId === 'openai') {
        const results: LLMProviderModel[] = []
        const openAI = new OpenAI({apiKey, baseURL: llmProvider.apiURL})
        const modelsPage = await openAI.models.list()
        for await (const models of modelsPage.iterPages()) {
            const modelList = models.data;
            results.push(...modelList.map(
                model => ({id: model.id, name: model.id})
            ))
        }
        return NextResponse.json<LLMProviderModelListResponse>({
            llmProviderModels: results,
        })
    } else if (llmProvider.providerId === 'anthropic') {
        const results: LLMProviderModel[] = []
        const anthropic = new Anthropic({apiKey, baseURL: llmProvider.apiURL});
        const modelsPage = await anthropic.models.list();
        for await (const models of modelsPage.iterPages()) {
            const modelList = models.data;
            results.push(...modelList.map(
                model => ({id: model.id, name: model.id})
            ))
        }
        return NextResponse.json<LLMProviderModelListResponse>({
            llmProviderModels: results,
        })
    } else if (llmProvider.providerId === 'google') {
        const url = new URL('https://generativelanguage.googleapis.com/v1beta/models');
        url.searchParams.append('key', apiKey);
        url.searchParams.append('pageSize', '1000');
        const response = await fetch(url.toString())
        const {models} = await response.json()
        return NextResponse.json<LLMProviderModelListResponse>({
            llmProviderModels: models.map(
                ({name, displayName}: { name: string, displayName: string }) => ({
                    id: name,
                    name: displayName
                })
            ),
        })
    } else if (llmProvider.providerId === 'ollama') {
        const apiURL = llmProvider.apiURL;
        const response = await fetch(`${apiURL}/api/tags`)
        const {models} = await response.json()
        return NextResponse.json<LLMProviderModelListResponse>({
            llmProviderModels: models.map(
                ({model, name}: { name: string, model: string }) => ({id: model, name})
            ),
        })
    }

    return NextResponse.json({error: 'Not implemented'}, {status: 403})
}
