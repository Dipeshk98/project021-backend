import { TranslatorRepository } from '@/repositories/TranslatorRepository';

export class TranslatorController {
  private translatorRepository: TranslatorRepository;

  constructor(translatorRepository: TranslatorRepository) {
    this.translatorRepository = translatorRepository;
  }

  public createTranslator = async (req, res) => {
    try {
      const form_id = req.params.form_id;
      const {
        status,
        first_name,
        middle_initial,
        last_name,
        street_address,
        city,
        state,
        zip_code
      } = req.body;

      let translatorData: any = {
        form_id,
        status: status?.toLowerCase(),
      };

      if (status?.toLowerCase() === 'yes') {
        // Add full data if status is 'yes'
        translatorData = {
          ...translatorData,
          first_name,
          middle_initial,
          last_name,
          street_address,
          city,
          state,
          zip_code
        };
      }

      const translator = await this.translatorRepository.createTranslator(translatorData);

      return res.status(201).json({
        success: true,
        message: 'Translator created successfully',
        data: translator,
      });
    } catch (error) {
      console.error('Error creating translator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create translator',
        error: error.message,
      });
    }
  };
}
