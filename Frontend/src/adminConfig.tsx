import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { getProcessador } from "./Processador";
import { resolvePhotoUrl } from "./lib/photoUtils";
import { Switch } from "./components/ui/switch";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";


// File removed - admin management moved to `config.tsx`.
// This file is intentionally kept as a small stub to avoid accidental imports.
export default null;