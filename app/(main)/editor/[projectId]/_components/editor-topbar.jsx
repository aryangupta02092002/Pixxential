"use client";

import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useCanvas } from "@/context/context";
import { usePlanAccess } from "@/hooks/use-plan-access";
import {
    ArrowLeft,
    RotateCcw,
    RotateCw,
    Crop,
    Expand,
    Sliders,
    Palette,
    Maximize2,
    ChevronDown,
    Text,
    RefreshCcw,
    Loader2,
    Eye,
    Save,
    Download,
    FileImage,
    Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from 'react';


const TOOLS = [
    {
        id: "resize",
        label: "Resize",
        icon: Expand,
        isActive: true,
    },
    {
        id: "crop",
        label: "Crop",
        icon: Crop,
    },
    {
        id: "adjust",
        label: "Adjust",
        icon: Sliders,
    },
    {
        id: "text",
        label: "Text",
        icon: Text,
    },
    {
        id: "background",
        label: "AI Background",
        icon: Palette,
        proOnly: true,
    },
    {
        id: "ai_extender",
        label: "AI Image Extender",
        icon: Maximize2,
        proOnly: true,
    },
    {
        id: "ai_edit",
        label: "AI Editing",
        icon: Eye,
        proOnly: true,
    },
];

const EXPORT_FORMATS = [
    {
        format: "PNG",
        quality: 1.0,
        label: "PNG (High Quality)",
        extension: "png",
    },
    {
        format: "JPEG",
        quality: 0.9,
        label: "JPEG (90% Quality)",
        extension: "jpg",
    },
    {
        format: "JPEG",
        quality: 0.8,
        label: "JPEG (80% Quality)",
        extension: "jpg",
    },
    {
        format: "WEBP",
        quality: 0.9,
        label: "WebP (90% Quality)",
        extension: "webp",
    },
];

const EditorTopbar = ({ project }) => {
    const router = useRouter();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [restrictedTool, setRestrictedTool] = useState(null);
    const { hasAccess, canExport, isFree } = usePlanAccess();

    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const { activeTool, onToolChange, canvasEditor } = useCanvas();

    const handleUndo = async () => {
        if (!canvasEditor || undoStack.length <= 1) return;

        setIsUndoRedoOperation(true);

        try {
            // Move current state to redo stack
            const currentState = JSON.stringify(canvasEditor.toJSON());
            setRedoStack((prev) => [...prev, currentState]);

            // Remove last state from undo stack and apply the previous one
            const newUndoStack = [...undoStack];
            newUndoStack.pop(); // Remove current state
            const previousState = newUndoStack[newUndoStack.length - 1];

            if (previousState) {
                await canvasEditor.loadFromJSON(JSON.parse(previousState));
                canvasEditor.requestRenderAll();
                setUndoStack(newUndoStack);
                toast.success("Undid last action");
            }
        } catch (error) {
            console.error("Error during undo:", error);
            toast.error("Failed to undo action");
        } finally {
            setTimeout(() => setIsUndoRedoOperation(false), 100);
        }
    };

    // Redo function
    const handleRedo = async () => {
        if (!canvasEditor || redoStack.length === 0) return;

        setIsUndoRedoOperation(true);

        try {
            // Get the latest state from redo stack
            const newRedoStack = [...redoStack];
            const nextState = newRedoStack.pop();

            if (nextState) {
                // Save current state to undo stack
                const currentState = JSON.stringify(canvasEditor.toJSON());
                setUndoStack((prev) => [...prev, currentState]);

                // Apply the redo state
                await canvasEditor.loadFromJSON(JSON.parse(nextState));
                canvasEditor.requestRenderAll();
                setRedoStack(newRedoStack);
                toast.success("Redid last action");
            }
        } catch (error) {
            console.error("Error during redo:", error);
            toast.error("Failed to redo action");
        } finally {
            setTimeout(() => setIsUndoRedoOperation(false), 100);
        }
    };

    const handleBackToDashboard = () => {
        router.push("/dashboard");
    };

    const handleToolChange = (toolId) => {
        if (!hasAccess(toolId)) {
            setRestrictedTool(toolId);
            setShowUpgradeModal(true);
            return;
        }
        onToolChange(toolId);
    };

    const canUndo = undoStack.length > 1;
    const canRedo = redoStack.length > 0;

    return (
        <>
            <div className="border-b px-6 py-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToDashboard}
                            className="text-white hover:text-gray-300"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            All Projects
                        </Button>
                    </div>

                    <h1 className="font-extrabold capitalize">{project.title}</h1>
                    <div>Right Actions</div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {TOOLS.map((tool) => {
                            const Icon = tool.icon;
                            const isActive = activeTool === tool.id;
                            const hasToolAccess = hasAccess(tool.id);

                            return (
                                <Button
                                    key={tool.id}
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => handleToolChange(tool.id)}
                                    className={`gap-2 relative ${isActive
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "text-white hover:text-gray-300 hover:bg-gray-100"
                                        } ${!hasToolAccess ? "opacity-60" : ""}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tool.label}
                                    {tool.proOnly && !hasToolAccess && (
                                        <Lock className="h-3 w-3 text-amber-400" />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Undo/Redo */}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-white ${!canUndo ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-700"}`}
                                onClick={handleUndo}
                                disabled={!canUndo || isUndoRedoOperation}
                                title={`Undo (${undoStack.length - 1} actions available)`}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`text-white ${!canRedo ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-700"}`}
                                onClick={handleRedo}
                                disabled={!canRedo || isUndoRedoOperation}
                                title={`Redo (${redoStack.length} actions available)`}
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <UpgradeModal 
                isOpen={showUpgradeModal}
                onClose={() => {
                    setShowUpgradeModal(false);
                    setRestrictedTool(null);
                }}
                restrictedTool={restrictedTool}
                reason={
                    restrictedTool === "export"
                    ? "Free plan users have limited export options, 20 exports per month. Upgrade to Pro for unlimited exports."
                    : undefined
                }
                />
        </>
    );
}

export default EditorTopbar;