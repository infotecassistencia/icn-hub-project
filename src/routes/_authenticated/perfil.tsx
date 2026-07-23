import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Camera,
  Check,
  Eye,
  ImageOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const PROFILE_BUCKET = "profile-photos";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type TipoProfissional =
  | "nutricionista"
  | "tecnico";

export const Route = createFileRoute(
  "/_authenticated/perfil",
)({
  head: () => ({
    meta: [
      {
        title: "Meu perfil — ICN Hub",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: Perfil,
});

function Perfil() {
  const {
    user,
    userId,
    refresh,
    isAdmin,
  } = useAuth();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState<File | null>(null);

  const [
    photoPreview,
    setPhotoPreview,
  ] = useState<string | null>(null);

  const [
    nomeExibicao,
    setNomeExibicao,
  ] = useState("");

  const [
    telefone,
    setTelefone,
  ] = useState("");

  const [
    novoEmail,
    setNovoEmail,
  ] = useState("");

  const [
    novaSenha,
    setNovaSenha,
  ] = useState("");

  const [
    confirmarSenha,
    setConfirmarSenha,
  ] = useState("");

  const [
    perfilPublico,
    setPerfilPublico,
  ] = useState(true);

  const [
    mostrarEmail,
    setMostrarEmail,
  ] = useState(false);

  const [
    mostrarTelefone,
    setMostrarTelefone,
  ] = useState(false);

  const [
    instituicao,
    setInstituicao,
  ] = useState("");

  const [
    semestre,
    setSemestre,
  ] = useState("");

  const [
    areaAtuacao,
    setAreaAtuacao,
  ] = useState("");

  const [
    novoTipoProfissional,
    setNovoTipoProfissional,
  ] = useState<TipoProfissional | "">("");

  const [
    novoCrn,
    setNovoCrn,
  ] = useState("");

  const [
    savingName,
    setSavingName,
  ] = useState(false);

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    removingPhoto,
    setRemovingPhoto,
  ] = useState(false);

  const [
    savingPhone,
    setSavingPhone,
  ] = useState(false);

  const [
    savingEmail,
    setSavingEmail,
  ] = useState(false);

  const [
    savingPassword,
    setSavingPassword,
  ] = useState(false);

  const [
    savingPreferences,
    setSavingPreferences,
  ] = useState(false);

  const [
    savingProfessionalData,
    setSavingProfessionalData,
  ] = useState(false);

  const [
    convertingToProfessional,
    setConvertingToProfessional,
  ] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setNomeExibicao(
      user.nomeExibicao,
    );

    setTelefone(
      formatPhoneInput(
        user.telefone,
      ),
    );

    setNovoEmail(
      user.email,
    );

    setPerfilPublico(
      user.perfilPublico,
    );

    setMostrarEmail(
      user.mostrarEmail,
    );

    setMostrarTelefone(
      user.mostrarTelefone,
    );

    setInstituicao(
      user.instituicao ?? "",
    );

    setSemestre(
      user.semestre ?? "",
    );

    setAreaAtuacao(
      user.areaAtuacao ?? "",
    );
  }, [
    user?.id,
    user?.nomeExibicao,
    user?.telefone,
    user?.email,
    user?.perfilPublico,
    user?.mostrarEmail,
    user?.mostrarTelefone,
    user?.instituicao,
    user?.semestre,
    user?.areaAtuacao,
  ]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview,
        );
      }
    };
  }, [photoPreview]);

  const opcoesNome =
    useMemo(() => {
      if (!user?.nome) {
        return [];
      }

      const palavras =
        user.nome
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      const palavrasUnicas =
        new Map<string, string>();

      palavras.forEach(
        (palavra) => {
          const chave =
            palavra.toLocaleLowerCase(
              "pt-BR",
            );

          if (
            !palavrasUnicas.has(
              chave,
            )
          ) {
            palavrasUnicas.set(
              chave,
              formatNameWord(
                palavra,
              ),
            );
          }
        },
      );

      return Array.from(
        palavrasUnicas.values(),
      );
    }, [user?.nome]);

  if (!user || !userId) {
    return null;
  }

  const currentUser = user;
  const currentUserId = userId;

  const currentPhoto =
    photoPreview ??
    currentUser.fotoUrl ??
    null;

  const nomeAlterado =
    nomeExibicao
      .toLocaleLowerCase(
        "pt-BR",
      ) !==
    currentUser.nomeExibicao
      .toLocaleLowerCase(
        "pt-BR",
      );

  const telefoneAlterado =
    onlyDigits(telefone) !==
    onlyDigits(
      currentUser.telefone,
    );

  const emailAlterado =
    novoEmail
      .trim()
      .toLocaleLowerCase(
        "pt-BR",
      ) !==
    currentUser.email
      .trim()
      .toLocaleLowerCase(
        "pt-BR",
      );

  const preferenciasAlteradas =
    perfilPublico !==
      currentUser.perfilPublico ||
    mostrarEmail !==
      currentUser.mostrarEmail ||
    mostrarTelefone !==
      currentUser.mostrarTelefone;

  const dadosAcademicosAlterados =
    instituicao.trim() !==
      (
        currentUser.instituicao ??
        ""
      ).trim() ||
    semestre.trim() !==
      (
        currentUser.semestre ??
        ""
      ).trim();

  const areaAtuacaoAlterada =
    areaAtuacao.trim() !==
    (
      currentUser.areaAtuacao ??
      ""
    ).trim();

  async function handleSaveDisplayName() {
    if (!nomeExibicao) {
      toast.error(
        "Selecione um nome em exibição.",
      );

      return;
    }

    setSavingName(true);

    try {
      const {
        error,
      } = await supabase.rpc(
        "atualizar_meu_nome_exibicao",
        {
          p_nome_exibicao:
            nomeExibicao,
        },
      );

      if (error) {
        throw error;
      }

      await refresh();

      toast.success(
        "Nome em exibição atualizado.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar nome em exibição:",
        error,
      );

      const message =
        getErrorMessage(error);

      if (
        message
          .toLocaleLowerCase(
            "pt-BR",
          )
          .includes(
            "palavra do nome completo",
          )
      ) {
        toast.error(
          "O nome em exibição deve fazer parte do seu nome completo.",
        );

        return;
      }

      toast.error(
        "Não foi possível atualizar o nome em exibição.",
      );
    } finally {
      setSavingName(false);
    }
  }

  function handlePhotoSelection(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !ACCEPTED_PHOTO_TYPES.includes(
        file.type,
      )
    ) {
      toast.error(
        "Selecione uma imagem JPG, PNG ou WebP.",
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      MAX_PHOTO_SIZE
    ) {
      toast.error(
        "A foto deve possuir no máximo 5 MB.",
      );

      event.target.value = "";
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(
        photoPreview,
      );
    }

    const preview =
      URL.createObjectURL(file);

    setSelectedPhoto(file);
    setPhotoPreview(preview);
  }

  async function handleUploadPhoto() {
    if (!selectedPhoto) {
      toast.error(
        "Selecione uma foto antes de salvar.",
      );

      return;
    }

    setUploadingPhoto(true);

    let uploadedPath:
      | string
      | null = null;

    try {
      const extension =
        getFileExtension(
          selectedPhoto.name,
          selectedPhoto.type,
        );

      const filePath =
        `${currentUserId}/avatar-${Date.now()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(PROFILE_BUCKET)
        .upload(
          filePath,
          selectedPhoto,
          {
            contentType:
              selectedPhoto.type,

            cacheControl:
              "3600",

            upsert: false,
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      uploadedPath = filePath;

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(PROFILE_BUCKET)
        .getPublicUrl(filePath);

      const newPhotoUrl =
        publicUrlData.publicUrl;

      const {
        error: profileError,
      } = await supabase.rpc(
        "atualizar_minha_foto",
        {
          p_foto_url:
            newPhotoUrl,
        },
      );

      if (profileError) {
        throw profileError;
      }

      const oldPhotoPath =
        getStoragePathFromUrl(
          currentUser.fotoUrl,
        );

      if (
        oldPhotoPath &&
        oldPhotoPath !== filePath
      ) {
        const {
          error: removeOldError,
        } = await supabase.storage
          .from(PROFILE_BUCKET)
          .remove([
            oldPhotoPath,
          ]);

        if (removeOldError) {
          console.warn(
            "Não foi possível remover a foto antiga:",
            removeOldError,
          );
        }
      }

      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview,
        );
      }

      setSelectedPhoto(null);
      setPhotoPreview(null);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      await refresh();

      toast.success(
        "Foto de perfil atualizada.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar foto:",
        error,
      );

      if (uploadedPath) {
        const {
          error: cleanupError,
        } = await supabase.storage
          .from(PROFILE_BUCKET)
          .remove([
            uploadedPath,
          ]);

        if (cleanupError) {
          console.warn(
            "Não foi possível remover o arquivo enviado após a falha:",
            cleanupError,
          );
        }
      }

      toast.error(
        "Não foi possível atualizar a foto de perfil.",
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleRemovePhoto() {
    if (!currentUser.fotoUrl) {
      return;
    }

    setRemovingPhoto(true);

    try {
      const {
        error: profileError,
      } = await supabase.rpc(
        "atualizar_minha_foto",
        {
          p_foto_url: "",
        },
      );

      if (profileError) {
        throw profileError;
      }

      const oldPhotoPath =
        getStoragePathFromUrl(
          currentUser.fotoUrl,
        );

      if (oldPhotoPath) {
        const {
          error: storageError,
        } = await supabase.storage
          .from(PROFILE_BUCKET)
          .remove([
            oldPhotoPath,
          ]);

        if (storageError) {
          console.warn(
            "Não foi possível remover o arquivo da foto:",
            storageError,
          );
        }
      }

      setSelectedPhoto(null);

      if (photoPreview) {
        URL.revokeObjectURL(
          photoPreview,
        );
      }

      setPhotoPreview(null);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

      await refresh();

      toast.success(
        "Foto de perfil removida.",
      );
    } catch (error) {
      console.error(
        "Erro ao remover foto:",
        error,
      );

      toast.error(
        "Não foi possível remover a foto.",
      );
    } finally {
      setRemovingPhoto(false);
    }
  }

  async function handleSavePhone() {
    const digits =
      onlyDigits(telefone);

    if (
      digits.length !== 10 &&
      digits.length !== 11
    ) {
      toast.error(
        "Informe um telefone com 10 ou 11 números.",
      );

      return;
    }

    setSavingPhone(true);

    try {
      const {
        error,
      } = await supabase.rpc(
        "atualizar_meu_telefone",
        {
          p_telefone: digits,
        },
      );

      if (error) {
        throw error;
      }

      await refresh();

      toast.success(
        "Telefone atualizado.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar telefone:",
        error,
      );

      toast.error(
        getErrorMessage(error) ||
          "Não foi possível atualizar o telefone.",
      );
    } finally {
      setSavingPhone(false);
    }
  }

  async function handleSaveEmail() {
    const email =
      novoEmail
        .trim()
        .toLocaleLowerCase(
          "pt-BR",
        );

    if (!isValidEmail(email)) {
      toast.error(
        "Informe um endereço de e-mail válido.",
      );

      return;
    }

    setSavingEmail(true);

    try {
      const {
        error,
      } =
await supabase.auth.updateUser(
  {
    email,
  },
  {
    emailRedirectTo: "http://10.174.154.74:8080/perfil",
  },
);

      if (error) {
        throw error;
      }

      toast.success(
        "Solicitação enviada. Verifique sua caixa de entrada para confirmar o novo e-mail.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar e-mail:",
        error,
      );

      toast.error(
        getErrorMessage(error) ||
          "Não foi possível atualizar o e-mail.",
      );
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleSavePassword() {
    if (novaSenha.length < 8) {
      toast.error(
        "A nova senha deve possuir pelo menos 8 caracteres.",
      );

      return;
    }

    if (
      novaSenha !==
      confirmarSenha
    ) {
      toast.error(
        "A confirmação da senha não corresponde à nova senha.",
      );

      return;
    }

    setSavingPassword(true);

    try {
      const {
        error,
      } =
        await supabase.auth.updateUser(
          {
            password: novaSenha,
          },
        );

      if (error) {
        throw error;
      }

      setNovaSenha("");
      setConfirmarSenha("");

      toast.success(
        "Senha atualizada com sucesso.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar senha:",
        error,
      );

      toast.error(
        getErrorMessage(error) ||
          "Não foi possível atualizar a senha.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSavePreferences() {
    setSavingPreferences(true);

    try {
      const {
        error,
      } = await supabase.rpc(
        "atualizar_minhas_preferencias",
        {
          p_perfil_publico:
            perfilPublico,

          p_mostrar_email:
            mostrarEmail,

          p_mostrar_telefone:
            mostrarTelefone,
        },
      );

      if (error) {
        throw error;
      }

      await refresh();

      toast.success(
        "Preferências de privacidade atualizadas.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar preferências:",
        error,
      );

      toast.error(
        getErrorMessage(error) ||
          "Não foi possível atualizar as preferências.",
      );
    } finally {
      setSavingPreferences(false);
    }
  }

  async function handleSaveAcademicData() {
    if (
      currentUser.tipo !==
      "estudante"
    ) {
      return;
    }

    if (
      instituicao.trim().length >
      150
    ) {
      toast.error(
        "A instituição deve possuir no máximo 150 caracteres.",
      );

      return;
    }

    if (
      semestre.trim().length >
      50
    ) {
      toast.error(
        "O semestre deve possuir no máximo 50 caracteres.",
      );

      return;
    }

    setSavingProfessionalData(true);

    try {
      const {
        error,
      } = await supabase.rpc(
        "atualizar_meus_dados_academicos",
        {
          p_instituicao:
            instituicao.trim(),

          p_semestre:
            semestre.trim(),
        },
      );

      if (error) {
        throw error;
      }

      await refresh();

      toast.success(
        "Dados acadêmicos atualizados.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar dados acadêmicos:",
        error,
      );

      toast.error(
        getErrorMessage(error) ||
          "Não foi possível atualizar os dados acadêmicos.",
      );
    } finally {
      setSavingProfessionalData(false);
    }
  }

  async function handleSaveProfessionalArea() {
    if (
      currentUser.tipo !==
        "nutricionista" &&
      currentUser.tipo !==
        "tecnico"
    ) {
      return;
    }

    if (
      areaAtuacao.trim().length >
      150
    ) {
      toast.error(
        "A área de atuação deve possuir no máximo 150 caracteres.",
      );

      return;
    }

    setSavingProfessionalData(true);

    try {
      const {
        error,
      } = await supabase.rpc(
        "atualizar_minha_area_atuacao",
        {
          p_area_atuacao:
            areaAtuacao.trim(),
        },
      );

      if (error) {
        throw error;
      }

      await refresh();

      toast.success(
        "Área de atuação atualizada.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar área de atuação:",
        error,
      );

      toast.error(
        getErrorMessage(error) ||
          "Não foi possível atualizar a área de atuação.",
      );
    } finally {
      setSavingProfessionalData(false);
    }
  }

  async function handleConvertToProfessional() {
    if (currentUser.tipo !== "estudante") {
      return;
    }

    if (!novoTipoProfissional) {
      toast.error(
        "Selecione a categoria profissional.",
      );

      return;
    }

    const crnNormalizado =
      normalizeCrn(novoCrn);

    if (!crnNormalizado) {
      toast.error(
        "Informe o número do CRN.",
      );

      return;
    }

    if (crnNormalizado.length < 4) {
      toast.error(
        "Informe um CRN válido.",
      );

      return;
    }

    if (crnNormalizado.length > 30) {
      toast.error(
        "O CRN deve possuir no máximo 30 caracteres.",
      );

      return;
    }

    if (!/^[A-Z0-9./ -]+$/.test(crnNormalizado)) {
      toast.error(
        "O CRN contém caracteres inválidos.",
      );

      return;
    }

    setConvertingToProfessional(true);

    try {
      const { error } = await supabase.rpc(
        "solicitar_perfil_profissional",
        {
          p_novo_tipo: novoTipoProfissional,
          p_crn: crnNormalizado,
        },
      );

      if (error) {
        throw error;
      }

      setNovoTipoProfissional("");
      setNovoCrn("");

      await refresh();

      toast.success(
        "Solicitação enviada para análise da administração.",
      );
    } catch (error) {
      console.error(
        "Erro ao alterar conta para profissional:",
        error,
      );

      const message =
        getErrorMessage(error);

      const normalizedMessage =
        message.toLocaleLowerCase(
          "pt-BR",
        );

      if (
        normalizedMessage.includes(
          "crn já está associado",
        )
      ) {
        toast.error(
          "Este CRN já está associado a outro usuário.",
        );

        return;
      }

      if (
        normalizedMessage.includes(
          "somente estudantes",
        )
      ) {
        toast.error(
          "Somente estudantes podem alterar para uma conta profissional.",
        );

        return;
      }

      toast.error(
        message ||
          "Não foi possível alterar a categoria da conta.",
      );
    } finally {
      setConvertingToProfessional(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">
          Meu perfil
        </h1>

        <p className="mt-1 text-muted-foreground">
          Gerencie sua identidade pública, segurança e dados
          cadastrais.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <ProfilePhoto
                photoUrl={currentPhoto}
                displayName={
                  nomeExibicao ||
                  currentUser.nomeExibicao
                }
              />

              <h2 className="mt-4 font-display text-xl font-semibold">
                {nomeExibicao ||
                  currentUser.nomeExibicao}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {getProfileLabel(
                  currentUser.tipo,
                )}
              </p>

              <Badge
                variant="secondary"
                className="mt-3"
              >
                {currentUser.tipo}
              </Badge>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" />

                Dados protegidos
              </CardTitle>

              <CardDescription>
                Estes dados somente poderão ser alterados pela
                administração.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ReadOnlyField
                label="Nome completo"
                value={
                  currentUser.nome ||
                  "—"
                }
              />

              <ReadOnlyField
                label="CPF"
                value={
                  formatCpf(
                    currentUser.cpf,
                  ) || "—"
                }
              />

              {currentUser.tipo !==
                "estudante" && (
                <ReadOnlyField
                  label="CRN"
                  value={
                    currentUser.crn ||
                    "—"
                  }
                />
              )}

              {isAdmin && (
                <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
                  Sua conta possui permissão administrativa.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />

                Foto de perfil
              </CardTitle>

              <CardDescription>
                Esta imagem será exibida no seu perfil e nas
                áreas públicas do ICN Hub.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <ProfilePhoto
                  photoUrl={currentPhoto}
                  displayName={
                    nomeExibicao ||
                    currentUser.nomeExibicao
                  }
                  size="small"
                />

                <div className="flex-1 space-y-2">
                  <Label htmlFor="profile-photo">
                    Escolher imagem
                  </Label>

                  <Input
                    ref={fileInputRef}
                    id="profile-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handlePhotoSelection
                    }
                    disabled={
                      uploadingPhoto ||
                      removingPhoto
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP. Tamanho máximo de 5 MB.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={
                    handleUploadPhoto
                  }
                  disabled={
                    !selectedPhoto ||
                    uploadingPhoto ||
                    removingPhoto
                  }
                >
                  {uploadingPhoto ? (
                    "Salvando foto..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar foto
                    </>
                  )}
                </Button>

                {currentUser.fotoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      handleRemovePhoto
                    }
                    disabled={
                      uploadingPhoto ||
                      removingPhoto
                    }
                  >
                    <ImageOff className="mr-2 h-4 w-4" />

                    {removingPhoto
                      ? "Removendo..."
                      : "Remover foto"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />

                Nome em exibição
              </CardTitle>

              <CardDescription>
                Escolha qual parte do seu nome completo será
                exibida publicamente.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>
                  Nome mostrado para outros usuários
                </Label>

                <Select
                  value={nomeExibicao}
                  onValueChange={
                    setNomeExibicao
                  }
                  disabled={
                    savingName
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>

                  <SelectContent>
                    {opcoesNome.map(
                      (nome) => (
                        <SelectItem
                          key={nome}
                          value={nome}
                        >
                          {nome}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pré-visualização pública
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <ProfilePhoto
                    photoUrl={
                      currentPhoto
                    }
                    displayName={
                      nomeExibicao
                    }
                    size="mini"
                  />

                  <div>
                    <p className="font-medium">
                      {nomeExibicao}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      É assim que outras pessoas verão seu nome.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={
                  handleSaveDisplayName
                }
                disabled={
                  !nomeAlterado ||
                  savingName
                }
              >
                {savingName ? (
                  "Salvando..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Salvar nome em exibição
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />

                Telefone
              </CardTitle>

              <CardDescription>
                Atualize o telefone utilizado para contato.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">
                  Telefone
                </Label>

                <Input
                  id="telefone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={15}
                  value={telefone}
                  onChange={(event) => {
                    setTelefone(
                      formatPhoneInput(
                        event.target.value,
                      ),
                    );
                  }}
                  placeholder="(00) 00000-0000"
                  disabled={
                    savingPhone
                  }
                />
              </div>

              <Button
                type="button"
                onClick={
                  handleSavePhone
                }
                disabled={
                  !telefoneAlterado ||
                  savingPhone
                }
              >
                {savingPhone
                  ? "Salvando..."
                  : "Salvar telefone"}
              </Button>
            </CardContent>
          </Card>

          {currentUser.tipo ===
          "estudante" ? (
            <>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />

                  Formação acadêmica
                </CardTitle>

                <CardDescription>
                  Informe sua instituição de ensino e o semestre
                  atual.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instituicao">
                      Instituição
                    </Label>

                    <Input
                      id="instituicao"
                      value={
                        instituicao
                      }
                      onChange={(
                        event,
                      ) => {
                        setInstituicao(
                          event.target
                            .value,
                        );
                      }}
                      maxLength={150}
                      placeholder="Nome da instituição"
                      disabled={
                        savingProfessionalData
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semestre">
                      Semestre
                    </Label>

                    <Input
                      id="semestre"
                      value={semestre}
                      onChange={(
                        event,
                      ) => {
                        setSemestre(
                          event.target
                            .value,
                        );
                      }}
                      maxLength={50}
                      placeholder="Ex.: 4º semestre"
                      disabled={
                        savingProfessionalData
                      }
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={
                    handleSaveAcademicData
                  }
                  disabled={
                    !dadosAcademicosAlterados ||
                    savingProfessionalData
                  }
                >
                  {savingProfessionalData
                    ? "Salvando..."
                    : "Salvar formação acadêmica"}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />

                  Tornar conta profissional
                </CardTitle>

                <CardDescription>
                  Altere sua categoria para nutricionista ou técnico
                  em Nutrição. O CRN é obrigatório e ficará vinculado
                  à sua conta.
                </CardDescription>
              </CardHeader>

<CardContent className="space-y-5">

  {currentUser.statusValidacao === "pendente" ? (

    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
      <p className="font-medium">
        Solicitação em análise
      </p>

      <p className="mt-2 text-sm">
        Categoria solicitada:

        <strong>
          {" "}
          {currentUser.tipoSolicitado === "nutricionista"
            ? "Nutricionista"
            : "Técnico em Nutrição"}
        </strong>
      </p>

      <p className="text-sm">
        CRN informado:

        <strong>
          {" "}
          {currentUser.crnSolicitado}
        </strong>
      </p>

      <p className="mt-3 text-sm">
        Aguarde a análise da administração.
      </p>
    </div>

  ) : (

    <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="novo-tipo-profissional">
                      Categoria profissional
                    </Label>

                    <Select
                      value={novoTipoProfissional}
                      onValueChange={(value) => {
                        setNovoTipoProfissional(
                          value as TipoProfissional,
                        );
                      }}
                      disabled={convertingToProfessional}
                    >
                      <SelectTrigger id="novo-tipo-profissional">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="nutricionista">
                          Nutricionista
                        </SelectItem>

                        <SelectItem value="tecnico">
                          Técnico em Nutrição
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="novo-crn">
                      CRN
                    </Label>

                    <Input
                      id="novo-crn"
                      value={novoCrn}
                      onChange={(event) => {
                        setNovoCrn(
                          normalizeCrnInput(
                            event.target.value,
                          ),
                        );
                      }}
                      maxLength={30}
                      placeholder="Ex.: CRN-2 12345"
                      autoComplete="off"
                      disabled={convertingToProfessional}
                    />
                  </div>
                </div>

<div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-900 dark:text-blue-200">
  Sua solicitação será enviada para análise da administração.

  Após a aprovação, sua conta será convertida para um perfil
  profissional e os dados acadêmicos serão removidos
  automaticamente.
</div>

                <Button
                  type="button"
                  onClick={handleConvertToProfessional}
                  disabled={
                    !novoTipoProfissional ||
                    !novoCrn.trim() ||
                    convertingToProfessional
                  }
                >
                  {convertingToProfessional
                    ? "Alterando categoria..."
                    : "Confirmar conta profissional"}
                </Button>
                    </>
                  )}
              </CardContent>
            </Card>
            </>
          ) : currentUser.tipo ===
              "nutricionista" ||
            currentUser.tipo ===
              "tecnico" ? (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />

                  Conta profissional
                </CardTitle>

                <CardDescription>
                  Atualize a sua área principal de atuação.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area-atuacao">
                    Área de atuação
                  </Label>

                  <Input
                    id="area-atuacao"
                    value={areaAtuacao}
                    onChange={(
                      event,
                    ) => {
                      setAreaAtuacao(
                        event.target
                          .value,
                      );
                    }}
                    maxLength={150}
                    placeholder="Ex.: Nutrição clínica"
                    disabled={
                      savingProfessionalData
                    }
                  />
                </div>

                <Button
                  type="button"
                  onClick={
                    handleSaveProfessionalArea
                  }
                  disabled={
                    !areaAtuacaoAlterada ||
                    savingProfessionalData
                  }
                >
                  {savingProfessionalData
                    ? "Salvando..."
                    : "Salvar área de atuação"}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />

                Preferências de privacidade
              </CardTitle>

              <CardDescription>
                Defina quais informações poderão ser exibidas
                no seu perfil público.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <PrivacyOption
                id="perfil-publico"
                title="Perfil público"
                description="Permitir que outros usuários encontrem e visualizem seu perfil."
                checked={perfilPublico}
                onChange={
                  setPerfilPublico
                }
                disabled={
                  savingPreferences
                }
              />

              <PrivacyOption
                id="mostrar-email"
                title="Mostrar e-mail"
                description="Exibir seu endereço de e-mail no perfil público."
                checked={
                  mostrarEmail
                }
                onChange={
                  setMostrarEmail
                }
                disabled={
                  savingPreferences ||
                  !perfilPublico
                }
              />

              <PrivacyOption
                id="mostrar-telefone"
                title="Mostrar telefone"
                description="Exibir seu telefone no perfil público."
                checked={
                  mostrarTelefone
                }
                onChange={
                  setMostrarTelefone
                }
                disabled={
                  savingPreferences ||
                  !perfilPublico
                }
              />

              {!perfilPublico && (
                <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Com o perfil público desativado, o e-mail e o
                  telefone não serão exibidos publicamente.
                </p>
              )}

              <Button
                type="button"
                onClick={
                  handleSavePreferences
                }
                disabled={
                  !preferenciasAlteradas ||
                  savingPreferences
                }
              >
                {savingPreferences
                  ? "Salvando..."
                  : "Salvar preferências"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5" />

                Segurança
              </CardTitle>

              <CardDescription>
                Altere o e-mail de acesso ou defina uma nova
                senha.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />

                  <h3 className="font-medium">
                    Alterar e-mail
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="novo-email">
                    Novo e-mail
                  </Label>

                  <Input
                    id="novo-email"
                    type="email"
                    autoComplete="email"
                    value={novoEmail}
                    onChange={(
                      event,
                    ) => {
                      setNovoEmail(
                        event.target
                          .value,
                      );
                    }}
                    disabled={
                      savingEmail
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    handleSaveEmail
                  }
                  disabled={
                    !emailAlterado ||
                    savingEmail
                  }
                >
                  {savingEmail
                    ? "Enviando..."
                    : "Solicitar alteração de e-mail"}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Dependendo da configuração do projeto, será
                  necessário confirmar a alteração por e-mail.
                </p>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />

                  <h3 className="font-medium">
                    Alterar senha
                  </h3>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nova-senha">
                      Nova senha
                    </Label>

                    <Input
                      id="nova-senha"
                      type="password"
                      autoComplete="new-password"
                      value={novaSenha}
                      onChange={(
                        event,
                      ) => {
                        setNovaSenha(
                          event.target
                            .value,
                        );
                      }}
                      disabled={
                        savingPassword
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmar-senha">
                      Confirmar nova senha
                    </Label>

                    <Input
                      id="confirmar-senha"
                      type="password"
                      autoComplete="new-password"
                      value={
                        confirmarSenha
                      }
                      onChange={(
                        event,
                      ) => {
                        setConfirmarSenha(
                          event.target
                            .value,
                        );
                      }}
                      disabled={
                        savingPassword
                      }
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Utilize pelo menos 8 caracteres.
                </p>

                <Button
                  type="button"
                  className="mt-4"
                  onClick={
                    handleSavePassword
                  }
                  disabled={
                    !novaSenha ||
                    !confirmarSenha ||
                    savingPassword
                  }
                >
                  {savingPassword
                    ? "Atualizando..."
                    : "Alterar senha"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>
                Informações da conta
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <ReadOnlyField
                label="E-mail atual"
                value={
                  currentUser.email ||
                  "—"
                }
              />

              <ReadOnlyField
                label="Telefone atual"
                value={
                  formatPhone(
                    currentUser.telefone,
                  ) || "—"
                }
              />

              <ReadOnlyField
                label="Tipo de perfil"
                value={getProfileLabel(
                  currentUser.tipo,
                )}
              />

              <ReadOnlyField
                label="Data de cadastro"
                value={formatDate(
                  currentUser.criadoEm,
                )}
              />

              <ReadOnlyField
                label="Última atualização"
                value={formatDate(
                  currentUser.atualizadoEm,
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PrivacyOption({
  id,
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean,
  ) => void;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange(
            event.target.checked,
          );
        }}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-border accent-primary"
      />

      <span>
        <span className="block text-sm font-medium">
          {title}
        </span>

        <span className="mt-1 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

function ProfilePhoto({
  photoUrl,
  displayName,
  size = "large",
}: {
  photoUrl: string | null;
  displayName: string;
  size?:
    | "large"
    | "small"
    | "mini";
}) {
  const sizeClass =
    size === "large"
      ? "h-32 w-32 text-3xl"
      : size === "small"
        ? "h-20 w-20 text-xl"
        : "h-11 w-11 text-sm";

  const initials =
    getInitials(displayName);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted font-semibold text-muted-foreground ${sizeClass}`}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`Foto de ${displayName}`}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="break-words text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

function getInitials(
  value: string,
): string {
  const words =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  return words
    .slice(0, 2)
    .map(
      (word) =>
        word[0]?.toUpperCase() ??
        "",
    )
    .join("");
}

function formatNameWord(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toLocaleUpperCase(
      "pt-BR",
    ) +
    value
      .slice(1)
      .toLocaleLowerCase(
        "pt-BR",
      )
  );
}

function getProfileLabel(
  tipo: string,
): string {
  switch (tipo) {
    case "nutricionista":
      return "Nutricionista";

    case "tecnico":
      return "Técnico em Nutrição";

    case "estudante":
      return "Estudante";

    case "participante":
      return "Participante";

    default:
      return tipo;
  }
}

function formatCpf(
  value: string,
): string {
  const digits =
    onlyDigits(value);

  if (digits.length !== 11) {
    return value;
  }

  return digits.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4",
  );
}

function formatPhone(
  value: string,
): string {
  const digits =
    onlyDigits(value);

  if (digits.length === 11) {
    return digits.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3",
    );
  }

  if (digits.length === 10) {
    return digits.replace(
      /(\d{2})(\d{4})(\d{4})/,
      "($1) $2-$3",
    );
  }

  return value;
}

function formatPhoneInput(
  value: string,
): string {
  const digits =
    onlyDigits(value).slice(
      0,
      11,
    );

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(
      0,
      2,
    )}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(
      0,
      2,
    )}) ${digits.slice(
      2,
      6,
    )}-${digits.slice(6)}`;
  }

  return `(${digits.slice(
    0,
    2,
  )}) ${digits.slice(
    2,
    7,
  )}-${digits.slice(7)}`;
}

function normalizeCrnInput(
  value: string,
): string {
  return value
    .toLocaleUpperCase(
      "pt-BR",
    )
    .replace(
      /[^A-Z0-9./ -]/g,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .slice(0, 30);
}

function normalizeCrn(
  value: string,
): string {
  return normalizeCrnInput(value)
    .trim()
    .replace(/\s{2,}/g, " ");
}

function onlyDigits(
  value: string,
): string {
  return value.replace(
    /\D/g,
    "",
  );
}

function isValidEmail(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  );
}

function formatDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "long",
    },
  ).format(date);
}

function getFileExtension(
  fileName: string,
  mimeType: string,
): string {
  const fileExtension =
    fileName
      .split(".")
      .pop()
      ?.toLocaleLowerCase() ??
    "";

  if (
    fileExtension === "jpg" ||
    fileExtension === "jpeg" ||
    fileExtension === "png" ||
    fileExtension === "webp"
  ) {
    return fileExtension;
  }

  switch (mimeType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "jpg";
  }
}

function getStoragePathFromUrl(
  photoUrl?: string | null,
): string | null {
  if (!photoUrl) {
    return null;
  }

  const marker =
    `/storage/v1/object/public/${PROFILE_BUCKET}/`;

  const markerPosition =
    photoUrl.indexOf(marker);

  if (markerPosition === -1) {
    return null;
  }

  const path =
    photoUrl.slice(
      markerPosition +
        marker.length,
    );

  try {
    return decodeURIComponent(
      path,
    );
  } catch {
    return path;
  }
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error ===
      "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message ===
      "string"
  ) {
    return error.message;
  }

  return "";
}