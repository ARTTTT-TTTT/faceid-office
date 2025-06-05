import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  openTermsDialog: boolean;
  setOpenTermsDialog: (open: boolean) => void;
};

export const TermsDialog: React.FC<Props> = ({
  openTermsDialog,
  setOpenTermsDialog,
}) => {
  const handleAccept = () => {
    setOpenTermsDialog(false);
  };

  return (
    <Dialog open={openTermsDialog} onOpenChange={setOpenTermsDialog}>
      <DialogContent className='px-8'>
        <DialogHeader>
          <DialogTitle className='text-center'>
            เงื่อนไขการให้บริการ
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          เงื่อนไขการให้บริการ
        </DialogDescription>
        <div className='max-h-[60vh] space-y-4 overflow-y-auto px-2 text-sm leading-relaxed text-muted-foreground'>
          <p className='text-justify'>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim quis
            explicabo, nisi repudiandae sequi ut unde numquam? Ullam explicabo
            pariatur, officiis at enim facilis, nesciunt impedit odit
            repellendus laboriosam eveniet.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleAccept}>ยอมรับและดำเนินการต่อ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
