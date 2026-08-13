import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';
import { AdminLoading, AdminError, AdminEmpty } from '../components/common/AdminStateComponents';

export const CmsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Pages state
  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  // Page Form Modal
  const [openPageModal, setOpenPageModal] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState('');

  // Banners state
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [openBannerModal, setOpenBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Testimonials state
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);

  // Media Vault state
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchPages = async () => {
    try {
      setLoadingPages(true);
      setPagesError(null);
      const res = await adminApi.getCmsPages();
      const payload = res.data || res;
      setPages(Array.isArray(payload) ? payload : payload.docs || payload.items || payload.pages || []);
    } catch (err: any) {
      setPagesError(err?.message || 'Failed to fetch CMS pages.');
    } finally {
      setLoadingPages(false);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const res = await adminApi.getCmsBanners();
      const payload = res.data || res;
      setBanners(Array.isArray(payload) ? payload : payload.docs || payload.items || payload.banners || []);
    } catch (_err) {
      setBanners([]);
    } finally {
      setLoadingBanners(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setLoadingTestimonials(true);
      const res = await adminApi.getCmsTestimonials();
      const payload = res.data || res;
      setTestimonials(Array.isArray(payload) ? payload : payload.docs || payload.items || payload.testimonials || []);
    } catch (_err) {
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoadingMedia(true);
      const res = await adminApi.getMediaList();
      const payload = res.data || res;
      setMediaList(Array.isArray(payload) ? payload : payload.docs || payload.items || payload.files || []);
    } catch (_err) {
      setMediaList([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) void fetchPages();
    else if (activeTab === 1) void fetchBanners();
    else if (activeTab === 2) void fetchTestimonials();
    else if (activeTab === 3) void fetchMedia();
  }, [activeTab]);

  const handleCreatePage = async () => {
    if (!pageTitle || !pageSlug) return;
    try {
      await adminApi.createCmsPage({ title: pageTitle, slug: pageSlug, content: pageContent });
      setOpenPageModal(false);
      setPageTitle('');
      setPageSlug('');
      setPageContent('');
      void fetchPages();
    } catch (err: any) {
      alert(err?.message || 'Failed to create CMS page.');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Delete this CMS page?')) return;
    try {
      await adminApi.deleteCmsPage(id);
      void fetchPages();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete page.');
    }
  };

  const handleCreateBanner = async () => {
    if (!bannerTitle || !bannerUrl) return;
    try {
      await adminApi.createCmsBanner({ title: bannerTitle, imageUrl: bannerUrl, isActive: true });
      setOpenBannerModal(false);
      setBannerTitle('');
      setBannerUrl('');
      void fetchBanners();
    } catch (err: any) {
      alert(err?.message || 'Failed to create banner.');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await adminApi.deleteCmsBanner(id);
      void fetchBanners();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete banner.');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await adminApi.deleteCmsTestimonial(id);
      void fetchTestimonials();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete testimonial.');
    }
  };

  const handleUploadMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('context', 'admin_cms');
      await adminApi.uploadMedia(formData);
      setUploadFile(null);
      void fetchMedia();
      alert('Media file uploaded successfully!');
    } catch (err: any) {
      alert(err?.message || 'Failed to upload media file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Delete this file from media vault?')) return;
    try {
      await adminApi.deleteMedia(id);
      void fetchMedia();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete media.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Content & Media Vault (CMS)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage static policy pages, promotional banners, customer reviews, and central media storage.
          </Typography>
        </Box>
        {activeTab === 0 && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenPageModal(true)}>
            Create CMS Page
          </Button>
        )}
        {activeTab === 1 && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenBannerModal(true)}>
            Add Banner
          </Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="CMS Pages" />
          <Tab label="Banners" />
          <Tab label="Testimonials" />
          <Tab label="Media Vault" />
        </Tabs>

        {/* Tab 0: Pages */}
        {activeTab === 0 && (
          <Box>
            {loadingPages ? (
              <AdminLoading message="Loading CMS pages..." />
            ) : pagesError ? (
              <AdminError message={pagesError} onRetry={fetchPages} />
            ) : pages.length === 0 ? (
              <AdminEmpty title="No CMS Pages" description="Click 'Create CMS Page' to publish Privacy Policy, Terms, etc." />
            ) : (
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Page Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>URL Slug</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pages.map((p) => (
                    <TableRow key={p.id || p._id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{p.title}</TableCell>
                      <TableCell>/{p.slug}</TableCell>
                      <TableCell>
                        <Chip label={p.isPublished === false ? 'DRAFT' : 'PUBLISHED'} color={p.isPublished === false ? 'default' : 'success'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDeletePage(p.id || p._id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* Tab 1: Banners */}
        {activeTab === 1 && (
          <Box>
            {loadingBanners ? (
              <AdminLoading message="Loading banners..." />
            ) : banners.length === 0 ? (
              <AdminEmpty title="No Banners Found" description="Add promotional banners to display on the mobile and web homepages." />
            ) : (
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Banner Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Image URL</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banners.map((b) => (
                    <TableRow key={b.id || b._id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{b.title || 'Untitled Banner'}</TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.imageUrl || b.url || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip label={b.isActive ? 'ACTIVE' : 'INACTIVE'} color={b.isActive ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDeleteBanner(b.id || b._id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* Tab 2: Testimonials */}
        {activeTab === 2 && (
          <Box>
            {loadingTestimonials ? (
              <AdminLoading message="Loading testimonials..." />
            ) : testimonials.length === 0 ? (
              <AdminEmpty title="No Testimonials Found" description="Customer reviews submitted will appear here." />
            ) : (
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Review Message</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testimonials.map((t) => (
                    <TableRow key={t.id || t._id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{t.name || t.author || 'Anonymous'}</TableCell>
                      <TableCell>{t.rating || 5} ★</TableCell>
                      <TableCell>{t.comment || t.message || t.content || 'N/A'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDeleteTestimonial(t.id || t._id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* Tab 3: Media Vault */}
        {activeTab === 3 && (
          <Box>
            <Paper elevation={0} component="form" onSubmit={handleUploadMediaSubmit} sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                Choose File
                <input type="file" hidden onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {uploadFile ? uploadFile.name : 'No file selected'}
              </Typography>
              <Button type="submit" variant="contained" disabled={!uploadFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </Paper>

            {loadingMedia ? (
              <AdminLoading message="Fetching media vault files..." />
            ) : mediaList.length === 0 ? (
              <AdminEmpty title="Media Vault Empty" description="Upload images or PDF documents to store in cloud storage." />
            ) : (
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>File Name / ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>File Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Uploaded Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mediaList.map((m) => (
                    <TableRow key={m.id || m._id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{m.originalName || m.filename || m.id || m._id}</TableCell>
                      <TableCell>{m.mimeType || m.mediaType || 'file'}</TableCell>
                      <TableCell>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDeleteMedia(m.id || m._id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </Paper>

      {/* Create CMS Page Dialog */}
      <Dialog open={openPageModal} onClose={() => setOpenPageModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Create CMS Page</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Page Title (e.g. Privacy Policy)" fullWidth size="small" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
            <TextField label="URL Slug (e.g. privacy-policy)" fullWidth size="small" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} />
            <TextField label="Page Markdown Content" multiline rows={6} fullWidth size="small" value={pageContent} onChange={(e) => setPageContent(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPageModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePage}>Publish Page</Button>
        </DialogActions>
      </Dialog>

      {/* Create Banner Dialog */}
      <Dialog open={openBannerModal} onClose={() => setOpenBannerModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Add Homepage Banner</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Banner Title" fullWidth size="small" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} />
            <TextField label="Banner Image URL" fullWidth size="small" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBannerModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateBanner}>Add Banner</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CmsManagement;
