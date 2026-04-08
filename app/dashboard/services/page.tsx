"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { CommonButton, CommonInput, PageHeader } from "@/components/common";
import {
  createCategory,
  deleteCategory,
  getCategories,
  type Category,
  updateCategory,
} from "@/lib/api/category";
import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "@/lib/api/service";
import { getSessionUserFromToken } from "@/lib/session";

interface Service {
  id: string;
  name: string;
  categoryId?: string;
  category?: { id: string; name: string };
  createdAt: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [newServiceName, setNewServiceName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [loadingServiceCreate, setLoadingServiceCreate] = useState(false);
  const [loadingCategoryCreate, setLoadingCategoryCreate] = useState(false);

  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState("");

  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const role = useMemo(() => getSessionUserFromToken()?.role, []);
  const canManageServices = role === "ADMIN" || role === "SUPER_ADMIN";
  const canManageCategories = role === "SUPER_ADMIN";

  const fetchServices = useCallback(async () => {
    try {
      const res: unknown = await getServices();
      if (Array.isArray(res)) {
        setServices(res as Service[]);
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to load services"));
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      if (Array.isArray(res)) {
        setCategories(res);
        setSelectedCategoryId((current) => current || res[0]?.id || "");
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to load categories"));
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchCategories, fetchServices]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageServices) {
      return;
    }

    if (!newServiceName.trim() || !selectedCategoryId) {
      return;
    }

    setLoadingServiceCreate(true);
    try {
      const res = await createService({
        name: newServiceName.trim(),
        categoryId: selectedCategoryId,
      });

      if (res?.id) {
        setNewServiceName("");
        await fetchServices();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to create service"));
    } finally {
      setLoadingServiceCreate(false);
    }
  };

  const handleUpdateService = async (id: string) => {
    if (!canManageServices) {
      return;
    }

    if (!editServiceName.trim()) {
      return;
    }

    try {
      const res = await updateService(id, { name: editServiceName.trim() });
      if (res?.id) {
        setEditServiceId(null);
        setEditServiceName("");
        await fetchServices();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update service"));
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!canManageServices) {
      return;
    }

    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const res = await deleteService(id);
      if (res?.id) {
        await fetchServices();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to delete service"));
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCategories) {
      return;
    }

    if (!newCategoryName.trim()) {
      return;
    }

    setLoadingCategoryCreate(true);
    try {
      const res = await createCategory({ name: newCategoryName.trim() });
      if (res?.id) {
        setNewCategoryName("");
        await fetchCategories();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to create category"));
    } finally {
      setLoadingCategoryCreate(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!canManageCategories) {
      return;
    }

    if (!editCategoryName.trim()) {
      return;
    }

    try {
      const res = await updateCategory(id, { name: editCategoryName.trim() });
      if (res?.id) {
        setEditCategoryId(null);
        setEditCategoryName("");
        await fetchCategories();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update category"));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!canManageCategories) {
      return;
    }

    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const res = await deleteCategory(id);
      if (res?.id) {
        if (selectedCategoryId === id) {
          setSelectedCategoryId("");
        }
        await Promise.all([fetchCategories(), fetchServices()]);
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to delete category"));
    }
  };

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Services"
        description="Manage services and categories used in enquiries"
      />

      {canManageCategories && (
        <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Category Management</h2>
          <form onSubmit={handleCreateCategory} className="flex flex-col gap-3 sm:flex-row">
            <CommonInput
              placeholder="Enter category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <CommonButton
              type="submit"
              loading={loadingCategoryCreate}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Category
            </CommonButton>
          </form>

          <div className="space-y-2">
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories available.</p>
            )}

            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                {editCategoryId === category.id ? (
                  <div className="flex w-full items-center gap-2">
                    <CommonInput
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <CommonButton size="icon" variant="ghost" onClick={() => handleUpdateCategory(category.id)}>
                      <Check className="h-4 w-4 text-green-600" />
                    </CommonButton>
                    <CommonButton
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditCategoryId(null);
                        setEditCategoryName("");
                      }}
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </CommonButton>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-gray-800">{category.name}</span>
                    <div className="flex items-center gap-1">
                      <CommonButton
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditCategoryId(category.id);
                          setEditCategoryName(category.name);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </CommonButton>
                      <CommonButton
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </CommonButton>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Service Management</h2>

        {canManageServices ? (
          <form onSubmit={handleCreateService} className="flex flex-col gap-3 sm:flex-row">
            <CommonInput
              placeholder="Enter service name..."
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="flex-1"
            />
            <select
              className="h-10 min-w-48 rounded-md border bg-white px-3 text-sm"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <CommonButton
              type="submit"
              loading={loadingServiceCreate}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Service
            </CommonButton>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            You can view services. Admin or Super Admin access is required to create, edit, or delete services.
          </p>
        )}

        <div className="space-y-2">
          {services.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">No services available.</p>
          )}

          {services.map((service) => {
            const categoryName = service.category?.name || categories.find((c) => c.id === service.categoryId)?.name || "Uncategorized";

            return (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                {editServiceId === service.id ? (
                  <div className="flex w-full items-center gap-2">
                    <CommonInput
                      value={editServiceName}
                      onChange={(e) => setEditServiceName(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <CommonButton size="icon" variant="ghost" onClick={() => handleUpdateService(service.id)}>
                      <Check className="h-4 w-4 text-green-600" />
                    </CommonButton>
                    <CommonButton
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditServiceId(null);
                        setEditServiceName("");
                      }}
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </CommonButton>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-gray-800">{service.name}</p>
                      <p className="text-xs text-muted-foreground">Category: {categoryName}</p>
                    </div>
                    {canManageServices && (
                      <div className="flex items-center gap-1">
                        <CommonButton
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditServiceId(service.id);
                            setEditServiceName(service.name);
                          }}
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </CommonButton>
                        <CommonButton
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </CommonButton>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
