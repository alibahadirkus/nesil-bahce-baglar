import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Loader2 } from 'lucide-react';
import { linkContentAPI } from '@/lib/api';

const Preview = () => {
  const { id } = useParams();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setError('Geçersiz link');
        setLoading(false);
        return;
      }

      try {
        const data = await linkContentAPI.getById(parseInt(id));
        setContent(data);
      } catch (err: any) {
        setError(err.message || 'İçerik yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">{error || 'İçerik bulunamadı'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-strong">
          <CardContent className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-primary rounded-full">
                  <Leaf className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {content.title}
              </h1>
              {content.description && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {content.description}
                </p>
              )}
            </div>

            {/* Images */}
            {content.images && content.images.length > 0 && (
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Resimler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.images.map((image: any, index: number) => (
                    <div
                      key={image.id || index}
                      className="rounded-lg overflow-hidden border shadow-soft hover:shadow-strong transition-shadow"
                    >
                      <img
                        src={image.url}
                        alt={image.original_name || `Resim ${index + 1}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Nesilden Nesile Yeşil Geleceğe
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Preview;

